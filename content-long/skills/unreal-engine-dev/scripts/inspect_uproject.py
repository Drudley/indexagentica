#!/usr/bin/env python3
"""Summarize an Unreal Engine project for an agent, without modifying anything.

Usage:
  python3 scripts/inspect_uproject.py [PROJECT_DIR_OR_UPROJECT] [--engine ENGINE_ROOT] [--json]

Prints: EngineAssociation, modules (from .uproject and Build.cs files), targets
(from *.Target.cs), enabled/disabled plugins, project plugins, engine version
(if --engine or $UE_ROOT is given) and ready-to-run build/test commands for the
host OS. Read-only: it never writes files. Python 3.8+, standard library only.
"""
import argparse
import json
import os
import platform
import re
import sys
from pathlib import Path

SKIP_DIRS = {"Binaries", "Intermediate", "Saved", "DerivedDataCache", ".git", ".vs", ".idea", "node_modules"}


def find_uproject(start: Path) -> Path:
    if start.is_file() and start.suffix == ".uproject":
        return start
    start = start.resolve()
    for d in [start, *start.parents]:
        hits = sorted(d.glob("*.uproject"))
        if hits:
            return hits[0]
    sys.exit(f"error: no .uproject found in {start} or its parents")


def load_json_lenient(path: Path):
    text = path.read_text(encoding="utf-8-sig", errors="replace")
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # .uproject/.uplugin files occasionally carry trailing commas; strip them and retry.
        return json.loads(re.sub(r",(\s*[}\]])", r"\1", text))


def walk(root: Path, pattern: str):
    if not root.is_dir():
        return []
    out = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for f in filenames:
            if Path(f).match(pattern):
                out.append(Path(dirpath) / f)
    return sorted(out)


def parse_targets(source: Path):
    targets = []
    for f in walk(source, "*.Target.cs"):
        text = f.read_text(encoding="utf-8", errors="replace")
        name = f.name[: -len(".Target.cs")]
        ttype = re.search(r"Type\s*=\s*TargetType\.(\w+)", text)
        bs = re.search(r"DefaultBuildSettings\s*=\s*BuildSettingsVersion\.(\w+)", text)
        io = re.search(r"IncludeOrderVersion\s*=\s*EngineIncludeOrderVersion\.(\w+)", text)
        targets.append({
            "name": name,
            "type": ttype.group(1) if ttype else "unknown",
            "default_build_settings": bs.group(1) if bs else None,
            "include_order_version": io.group(1) if io else None,
            "file": str(f),
        })
    return targets


def parse_build_cs(roots):
    mods = []
    for root in roots:
        for f in walk(root, "*.Build.cs"):
            text = f.read_text(encoding="utf-8", errors="replace")
            def deps(kind):
                found = []
                for m in re.finditer(kind + r"DependencyModuleNames\s*\.\s*(?:AddRange|Add)\s*\((.*?)\)\s*;", text, re.S):
                    found += re.findall(r'"([^"]+)"', m.group(1))
                return sorted(set(found))
            mods.append({
                "name": f.name[: -len(".Build.cs")],
                "file": str(f),
                "public_deps": deps("Public"),
                "private_deps": deps("Private"),
                "pch_usage": (re.search(r"PCHUsage\s*=\s*PCHUsageMode\.(\w+)", text) or [None, None])[1],
            })
    return mods


def engine_version(engine: Path):
    bv = engine / "Engine" / "Build" / "Build.version"
    if not bv.is_file():
        return None
    try:
        d = load_json_lenient(bv)
        return f'{d.get("MajorVersion")}.{d.get("MinorVersion")}.{d.get("PatchVersion")}'
    except Exception:
        return None


def commands(engine: str, uproject: Path, editor_target: str):
    system = platform.system()
    up = str(uproject.resolve())
    e = engine or "<UE_ROOT>"
    if system == "Windows":
        build = f'"{e}\\Engine\\Build\\BatchFiles\\Build.bat" {editor_target} Win64 Development -Project="{up}" -WaitMutex'
        cmd = f'"{e}\\Engine\\Binaries\\Win64\\UnrealEditor-Cmd.exe"'
        uat = f'"{e}\\Engine\\Build\\BatchFiles\\RunUAT.bat"'
    elif system == "Darwin":
        build = f'"{e}/Engine/Build/BatchFiles/Mac/Build.sh" {editor_target} Mac Development -Project="{up}" -WaitMutex'
        cmd = f'"{e}/Engine/Binaries/Mac/UnrealEditor.app/Contents/MacOS/UnrealEditor"'
        uat = f'"{e}/Engine/Build/BatchFiles/RunUAT.sh"'
    else:
        build = f'"{e}/Engine/Build/BatchFiles/Linux/Build.sh" {editor_target} Linux Development -Project="{up}" -WaitMutex'
        cmd = f'"{e}/Engine/Binaries/Linux/UnrealEditor-Cmd"'
        uat = f'"{e}/Engine/Build/BatchFiles/RunUAT.sh"'
    report = str(uproject.parent.resolve() / "Saved" / "TestReport")
    return {
        "build_editor": build,
        "run_tests": f'{cmd} "{up}" -ExecCmds="Automation RunTest {uproject.stem};Quit" -unattended -nullrhi -stdout -ReportExportPath="{report}"',
        "python_commandlet": f'{cmd} "{up}" -run=pythonscript -script="<abs path to script.py>"',
        "fixup_redirectors": f'{cmd} "{up}" -run=ResavePackages -fixupredirects -projectonly -unattended',
        "package": f'{uat} BuildCookRun -project="{up}" -clientconfig=Development -build -cook -stage -package',
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("path", nargs="?", default=".")
    ap.add_argument("--engine", default=os.environ.get("UE_ROOT"), help="engine root (folder that contains Engine/); defaults to $UE_ROOT")
    ap.add_argument("--json", action="store_true", help="print JSON instead of text")
    a = ap.parse_args()

    up = find_uproject(Path(a.path))
    root = up.parent
    desc = load_json_lenient(up)
    source = root / "Source"
    plugin_files = walk(root / "Plugins", "*.uplugin")
    targets = parse_targets(source)
    build_mods = parse_build_cs([source] + [p.parent / "Source" for p in plugin_files])
    editor_targets = [t["name"] for t in targets if t["type"] == "Editor"]
    editor_target = editor_targets[0] if editor_targets else f"{up.stem}Editor"

    warnings = []
    if not source.is_dir():
        warnings.append("No Source/ folder: Blueprint-only project, nothing to compile.")
    elif not editor_targets:
        warnings.append("No Editor-type *.Target.cs found; the editor cannot load C++ changes until one exists.")
    declared = {m.get("Name") for m in desc.get("Modules", []) or []}
    found = {m["name"] for m in build_mods if str(source) in m["file"]}
    for missing in sorted(declared - found):
        warnings.append(f'Module "{missing}" is listed in the .uproject but no {missing}.Build.cs was found under Source/.')
    if any(t["default_build_settings"] == "Latest" for t in targets):
        warnings.append("A target uses BuildSettingsVersion.Latest; engine upgrades may introduce new build errors.")

    info = {
        "uproject": str(up.resolve()),
        "engine_association": desc.get("EngineAssociation"),
        "engine_root": a.engine,
        "engine_version": engine_version(Path(a.engine)) if a.engine else None,
        "uproject_modules": desc.get("Modules", []),
        "plugins_in_uproject": [{"name": p.get("Name"), "enabled": p.get("Enabled")} for p in desc.get("Plugins", []) or []],
        "project_plugins": [str(p.relative_to(root)) for p in plugin_files],
        "targets": targets,
        "build_cs_modules": build_mods,
        "content_assets": sum(1 for _ in walk(root / "Content", "*.uasset")) + sum(1 for _ in walk(root / "Content", "*.umap")),
        "warnings": warnings,
        "commands": commands(a.engine, up, editor_target),
    }

    if a.json:
        print(json.dumps(info, indent=2))
        return
    print(f"Project:            {info['uproject']}")
    print(f"EngineAssociation:  {info['engine_association']!r}")
    if a.engine:
        print(f"Engine root:        {a.engine} (version {info['engine_version'] or 'unknown: Engine/Build/Build.version not found'})")
    print("Modules (.uproject):")
    for m in info["uproject_modules"] or []:
        print(f"  - {m.get('Name')}  Type={m.get('Type')}  LoadingPhase={m.get('LoadingPhase', 'Default')}")
    print("Targets:")
    for t in targets:
        print(f"  - {t['name']}  Type={t['type']}  DefaultBuildSettings={t['default_build_settings']}  IncludeOrder={t['include_order_version']}")
    print("Build.cs modules:")
    for m in build_mods:
        print(f"  - {m['name']}  PCHUsage={m['pch_usage']}  public={m['public_deps']}  private={m['private_deps']}")
    if info["plugins_in_uproject"]:
        print("Plugins in .uproject:")
        for p in info["plugins_in_uproject"]:
            print(f"  - {p['name']}  Enabled={p['enabled']}")
    if info["project_plugins"]:
        print("Project plugins:", ", ".join(info["project_plugins"]))
    print(f"Binary assets under Content/: {info['content_assets']} (.uasset/.umap; never edit as text)")
    for w in warnings:
        print(f"WARNING: {w}")
    print("\nCommands (check target names and paths before running):")
    for k, v in info["commands"].items():
        print(f"  {k}:\n    {v}")


if __name__ == "__main__":
    main()
