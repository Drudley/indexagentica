---
name: unreal-engine-dev
description: Work safely in Unreal Engine 5 projects as a coding agent. Covers the .uproject, module and Build.cs/Target.cs layout, C++ reflection macros (UCLASS, UPROPERTY, UFUNCTION, GENERATED_BODY) and garbage-collection rules, why .uasset/.umap files are binary and must never be edited as text, headless builds with UnrealBuildTool and RunUAT BuildCookRun, commandlets and automation tests from the command line, editor scripting with Python, Live Coding caveats, and fixes for common compile and linker errors. Also covers Epic's experimental Unreal MCP plugin (UE 5.8). Use when a repository contains a .uproject file, Source/*.Build.cs or Content/*.uasset files, or when asked to build, test, package, script or debug an Unreal Engine project or plugin.
license: MIT
compatibility: Verified against the Unreal Engine 5.8 documentation. Most guidance applies to UE 5.x, and version-specific items are marked. Building needs a local engine install (Launcher, source or Linux zip build) plus the platform toolchain (Visual Studio 2022 17.14+ or 2026 on Windows, clang on Linux, Xcode on macOS). The helper script needs Python 3.8+.
metadata:
  title: Unreal Engine development for coding agents
  summary: Rules, commands and fixes an AI coding agent needs in an Unreal Engine 5 project, from module layout and reflection macros to headless builds, automation tests, Python editor scripting and Unreal MCP.
  author: Agentica Author
  version: "1.0"
  last_verified: 2026-10-02
  published: 2026-10-02
  tags: unreal-engine, game-engine, gamedev, cpp, build-tools, testing, editor-scripting
  entries: model-context-protocol, mcp-inspector, claude-code, cursor, codex-cli, gemini-cli, agent-skills-spec
  related: connect-remote-mcp
  engine_version: "5.8"
  sources: https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-5-8-release-notes https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-modules https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-build-tool-target-reference https://dev.epicgames.com/documentation/en-us/unreal-engine/module-properties-in-unreal-engine https://dev.epicgames.com/documentation/en-us/unreal-engine/objects-in-unreal-engine https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-object-handling-in-unreal-engine https://dev.epicgames.com/documentation/en-us/unreal-engine/using-perforce-as-source-control-for-unreal-engine https://dev.epicgames.com/documentation/en-us/unreal-engine/build-operations-cooking-packaging-deploying-and-running-projects-in-unreal-engine https://dev.epicgames.com/documentation/en-us/unreal-engine/run-automation-tests-in-unreal-engine https://dev.epicgames.com/documentation/en-us/unreal-engine/scripting-the-unreal-editor-using-python https://dev.epicgames.com/documentation/en-us/unreal-engine/using-live-coding-to-recompile-unreal-engine-applications-at-runtime https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-mcp-in-unreal-editor
---

# Unreal Engine development for coding agents

Checked against Epic's **Unreal Engine 5.8** documentation on 2026-10-02. UE 5.8 is the current release and, according to Epic, the last planned major UE5 release. Most of this applies to UE 5.x. Items marked **(5.8)** are newer and may be missing in older engines.

Unreal is not a normal C++ codebase. The build system, code generator, garbage collector and binary asset format all have rules that a compiler alone won't catch. Read the hard rules below before you change anything.

## Bundled files (load only when needed)

| File | Read it when |
|---|---|
| `references/project-layout.md` | You need the .uproject, module, Build.cs, Target.cs, Config, plugin or version-control details |
| `references/cpp-reflection-gc.md` | You are writing or reviewing UCLASS/USTRUCT/UPROPERTY/UFUNCTION code or UObject lifetimes |
| `references/cli-build-test.md` | You need to build, cook, package, run commandlets or run automation tests without the GUI |
| `references/editor-automation.md` | You need to change assets, Blueprints or levels (Python, commandlets, Unreal MCP) |
| `references/troubleshooting.md` | A build, link, Live Coding or editor-startup step fails |
| `scripts/inspect_uproject.py` | First step in an unfamiliar project. It prints the engine association, modules, targets and plugins, plus the exact build commands |

## Orient first (one minute)

1. Run `python3 scripts/inspect_uproject.py <project dir> [--engine <engine root>]`, or read the `.uproject` (JSON) yourself. `EngineAssociation` names the engine the project opens with. `Modules` lists the C++ modules with their `Type` (`Runtime`, `Editor`, ...) and `LoadingPhase`. `Plugins` lists the plugins that are enabled or disabled.
2. Find the engine root. The exact version is in `Engine/Build/Build.version` (JSON). Don't assume APIs from a newer engine than the one the project uses.
3. If there's no `Source/` folder, the project is Blueprint-only and there is nothing to compile. Adding C++ means creating `Source/`, `*.Target.cs` and a module. The editor's New C++ Class wizard generates these.
4. Ask or check whether the Unreal Editor is open on this project. That changes how you build (see Live Coding).

## Hard rules

1. **Never edit `.uasset` or `.umap` files as text, and never move, rename or delete them with shell commands.** Epic's docs say these files are binary and can't be opened as text or merged in a text merge tool. Assets reference each other by path, so filesystem moves break references. Change content through the editor, the Python API (`unreal.EditorAssetLibrary`, `unreal.AssetTools`), commandlets or Unreal MCP. Moves and renames leave **redirectors** behind; clean them up with the `ResavePackages` commandlet's `-fixupredirects` option (see `references/editor-automation.md`). With One File Per Actor, actors are saved as separate external packages, which are binary too.
2. **Treat `Binaries/`, `Intermediate/`, `Saved/` and `DerivedDataCache/` as generated.** Never edit them by hand. Epic's docs say `Intermediate/` and `Saved/` can be deleted and rebuilt. IDE files (`.sln`, `.vcxproj`, `.code-workspace`) are generated outputs that UnrealBuildTool (UBT) ignores. Don't commit them.
3. **Build with UBT (`Build.bat` / `Build.sh`), not the IDE project.** UBT reads `*.Target.cs` and `*.Build.cs`. Every module whose headers you include must be listed in `PublicDependencyModuleNames` or `PrivateDependencyModuleNames`, or you'll get missing-include or unresolved-symbol errors.
4. **Don't rename reflected C++ types, properties or functions without a Core Redirect.** Saved assets refer to them by name. Add `[CoreRedirects]` entries such as `+ClassRedirects=` and `+PropertyRedirects=` to `Config/DefaultEngine.ini`, or existing Blueprints and levels lose data.
5. **Keep UObjects alive through reflection.** A `UObject*` that isn't a `UPROPERTY`, isn't in a `UPROPERTY` container and isn't held by `TStrongObjectPtr` can be garbage collected, leaving a dangling pointer. Use `TObjectPtr<T>` for `UPROPERTY` members, which Epic recommends in UE5. Never `new` or `delete` UObjects. Use `NewObject<T>()`, or `CreateDefaultSubobject<T>()` in constructors only. `TSharedPtr` and `TUniquePtr` don't work with UObjects.
6. **The `#include "X.generated.h"` line must be the last include in the header, and every `UCLASS`/`USTRUCT` needs `GENERATED_BODY()`.** Class names need the right prefix (`U` for UObject, `A` for AActor, `F` for structs, `E` for enums, `I` for interfaces). Unreal Header Tool (UHT) relies on these prefixes.
7. **Don't run an external build while the editor has a Live Coding session for the project.** UBT refuses with "Unable to build while Live Coding is active". Either let the user press Ctrl+Alt+F11 in the editor, or close the editor and then build. Header or reflection changes are safest with the editor closed and a full build.
8. **Python is editor-only.** The `unreal` Python module runs in the editor and in commandlets, never in PIE (Play In Editor), standalone or cooked games. Write gameplay code in C++ or Blueprint.
9. **Make the smallest change possible to `.uproject`, `.uplugin`, `*.Target.cs` and `Config/Default*.ini`.** Don't change `EngineAssociation`, `DefaultBuildSettings` or `IncludeOrderVersion` as a side effect of other work. Epic warns that `BuildSettingsVersion.Latest` can introduce build errors when you upgrade.

## Core commands

Replace `<UE>` with the engine root, `MyGame` with the project name, and use the target names that the `*.Target.cs` files define. The editor target is usually `MyGameEditor`.

```bash
# Build the editor target (Linux). Windows: "<UE>\Engine\Build\BatchFiles\Build.bat" MyGameEditor Win64 Development ...
"<UE>/Engine/Build/BatchFiles/Linux/Build.sh" MyGameEditor Linux Development -Project="/abs/path/MyGame.uproject" -WaitMutex

# Headless automation tests (editor tests). Windows binary: Engine\Binaries\Win64\UnrealEditor-Cmd.exe
"<UE>/Engine/Binaries/Linux/UnrealEditor-Cmd" "/abs/path/MyGame.uproject" \
  -ExecCmds="Automation RunTest MyGame;Quit" -unattended -nullrhi -stdout \
  -ReportExportPath="/abs/path/Saved/TestReport"

# Run a Python script in a headless commandlet (needs the Python Editor Script Plugin enabled)
"<UE>/Engine/Binaries/Linux/UnrealEditor-Cmd" "/abs/path/MyGame.uproject" -run=pythonscript -script="/abs/path/tool.py"

# Cook, stage and package (RunUAT.bat on Windows)
"<UE>/Engine/Build/BatchFiles/RunUAT.sh" BuildCookRun -project="/abs/path/MyGame.uproject" -clientconfig=Development -build -cook -stage -package
```

Don't rely on the process exit code alone to judge a test run. Read the JSON report under `-ReportExportPath` or the log for failures. Details, flags and caveats are in `references/cli-build-test.md`.

## Minimal correct UObject header

```cpp
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "MyActor.generated.h" // must be the last #include

UCLASS()
class MYGAME_API AMyActor : public AActor // MYGAME_API exports the class to other modules
{
    GENERATED_BODY()

public:
    AMyActor(); // no constructor arguments; set defaults and subobjects only

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combat")
    float Health = 100.f;

    UPROPERTY(VisibleAnywhere, Category = "Components")
    TObjectPtr<UStaticMeshComponent> Mesh; // reflected, so GC keeps it alive

    UFUNCTION(BlueprintCallable, Category = "Combat")
    void ApplyDamage(float Amount);

    UFUNCTION(BlueprintNativeEvent, Category = "Combat")
    void OnDied(); // implement AMyActor::OnDied_Implementation() in the .cpp

protected:
    virtual void BeginPlay() override; // runtime initialization goes here, not in the constructor
};
```

## Blueprints versus C++

Epic's guidance is to build systems in C++ and expose them to Blueprint. Use `BlueprintCallable`, `BlueprintReadWrite`, `BlueprintImplementableEvent` and `BlueprintNativeEvent` for this, or a `UBlueprintFunctionLibrary` for static helpers. Designers then build behaviour in Blueprint subclasses. As an agent you can't diff or patch Blueprint graphs as text. Prefer putting logic in C++ and exposing hooks. When a Blueprint asset itself has to change, script it through the editor: the UE 5.8 Python API added `unreal.BlueprintGraphEditor` and expanded `unreal.BlueprintEditorLibrary` **(5.8)**. You can also use Unreal MCP. Then compile and save the asset, and run tests.

## Unreal MCP (UE 5.8, Experimental)

UE 5.8 ships an **Experimental** "Unreal MCP" plugin (identifier `ModelContextProtocol`). It runs an MCP server inside the editor at `http://127.0.0.1:8000/mcp` (HTTP/SSE, loopback only, no authentication). Agents get editor tools for actors, materials, Blueprints, Slate inspection and automation tests. It needs the **All Toolsets** plugin as well. `ModelContextProtocol.GenerateClientConfig ClaudeCode|Cursor|VSCode|Gemini|Codex|All` writes the client config. Tool calls run one at a time on the game thread, so don't send overlapping calls. By default `tools/list` returns only `list_toolsets`, `describe_toolset` and `call_tool`. Setup, safety notes and community alternatives are in `references/editor-automation.md`.

## Before you report "done"

- The build succeeds for every target you touched. Editor-only code must not leak into Game targets: put it in an `Editor`-type module or guard it with `#if WITH_EDITOR`.
- Relevant automation tests pass, and you've checked the report rather than only the exit code.
- You haven't edited, moved or deleted any binary asset outside the editor or its APIs. Any renamed reflected symbols have Core Redirects.
- No generated folders or IDE files are staged in version control.
- If you couldn't build because the editor was open with Live Coding, say so. Don't claim the build was verified.

## Sources

Epic Unreal Engine 5.8 documentation: https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-5-8-release-notes, https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-modules, https://dev.epicgames.com/documentation/en-us/unreal-engine/objects-in-unreal-engine, https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-object-handling-in-unreal-engine, https://dev.epicgames.com/documentation/en-us/unreal-engine/using-perforce-as-source-control-for-unreal-engine, https://dev.epicgames.com/documentation/en-us/unreal-engine/coding-in-unreal-engine-blueprint-vs-cplusplus, https://dev.epicgames.com/documentation/en-us/unreal-engine/scripting-the-unreal-editor-using-python, https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-mcp-in-unreal-editor. Each reference file lists its own sources.
