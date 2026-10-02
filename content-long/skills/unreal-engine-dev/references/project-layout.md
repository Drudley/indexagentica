# Project and module layout (UE 5.8)

Part of the `unreal-engine-dev` skill. Verified against the Unreal Engine 5.8 documentation on 2026-10-02.

## Project tree

```text
MyGame/
  MyGame.uproject          JSON descriptor: EngineAssociation, Modules, Plugins
  Config/                  Default*.ini project settings (commit these)
  Content/                 .uasset / .umap packages (binary; commit, but never text-edit)
  Source/
    MyGame.Target.cs       Game target  (class MyGameTarget)
    MyGameEditor.Target.cs Editor target (class MyGameEditorTarget)
    MyGame/                primary module
      MyGame.Build.cs      class MyGame : ModuleRules
      Public/  Private/    headers for other modules / everything else
  Plugins/<Name>/<Name>.uplugin, Source/, Content/
  Binaries/ Intermediate/ Saved/ DerivedDataCache/   generated, do not edit or commit
```

Epic's directory reference describes `Binaries` (compiled output), `Intermediate` (temporary build files, including generated IDE project files, which can be deleted and rebuilt), `Saved` (logs, autosaves and engine-generated config, which can be deleted and rebuilt) and `DerivedDataCache` (derived data for referenced content).

## .uproject

`FProjectDescriptor` is the engine type behind the `.uproject` file. It has `FileVersion`, `EngineAssociation` ("the engine to open this project with"), `Category`, `Description`, `Modules` and `Plugins`. A module entry looks like this:

```json
{ "Name": "MyGame", "Type": "Runtime", "LoadingPhase": "Default" }
```

- `Type`: the most common values are `Runtime` (game code) and `Editor` (editor-only code). Editor modules are not part of Game, Client or Server targets.
- `LoadingPhase`: `Default` suits most gameplay modules. Epic suggests `PreDefault` if the editor reports that it can't find C++ classes in a plugin module.
- Optional allow and deny lists: `IncludelistPlatforms`/`ExcludelistPlatforms`, `IncludelistTargets`/`ExcludelistTargets` (Game, Server, Client, Editor, Program) and `IncludelistTargetConfigurations`/`ExcludelistTargetConfigurations`.
- When a module needs a plugin, enable the plugin in `Plugins` (`{"Name": "X", "Enabled": true}`) and add the plugin's module to `Build.cs`.

## Modules and Build.cs

Epic's module guide says:

- A module is a folder under `Source/` (any depth) that contains `<ModuleName>.Build.cs`. The folder name and module name should match.
- Put `.cpp` files and private headers in `Private/`, and headers that other modules include in `Public/`. A module that nothing else depends on, such as the game's primary module, can skip the split.
- A module needs exactly one implementation macro in a `.cpp` file in `Private/`: `IMPLEMENT_MODULE(FDefaultModuleImpl, ModuleName);` for a plain module. A game project needs exactly one module registered with `IMPLEMENT_PRIMARY_GAME_MODULE`, and any further gameplay modules use `IMPLEMENT_GAME_MODULE`.
- Use `PublicDependencyModuleNames` when a dependency's types appear in your public headers, and `PrivateDependencyModuleNames` when they appear only in `.cpp` files or private headers. Prefer private dependencies and forward declarations, because they compile faster.
- To use a type from another module, export it with `<MODULE>_API` (for example `class MYGAME_API UMyThing`). Without the export, other modules hit linker errors.
- Unreal modules are not C++20 modules.

```csharp
using UnrealBuildTool;

public class MyGame : ModuleRules
{
    public MyGame(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs; // IWYU-style module
        PublicDependencyModuleNames.AddRange(new string[] { "Core", "CoreUObject", "Engine" });
        PrivateDependencyModuleNames.AddRange(new string[] { "EnhancedInput" });
    }
}
```

Other `ModuleRules` properties you may run into include `PCHUsage`, `bUseUnity`, `CppStandard`, `ShadowVariableWarningLevel`, `UndefinedIdentifierWarningLevel`, `bEnforceIWYU` and `IWYUSupport`. See Module Properties for the full list.

Put editor-only code (anything depending on `UnrealEd`, editor subsystems or Slate editor widgets) in a separate module with `"Type": "Editor"`, or wrap small pieces in `#if WITH_EDITOR`. The `TargetRules` reference describes `bBuildEditor` and recommends the more explicit `bCompileAgainstEditor`.

## Target.cs

UBT supports these target types: `Game` (needs cooked data), `Client`, `Server`, `Editor` and `Program`. Each one is a `*.Target.cs` file in `Source/`. The class name must be the file name followed by `Target`.

```csharp
using UnrealBuildTool;
using System.Collections.Generic;

public class MyGameEditorTarget : TargetRules
{
    public MyGameEditorTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Editor;
        DefaultBuildSettings = BuildSettingsVersion.Latest;           // templates pin an explicit version
        IncludeOrderVersion = EngineIncludeOrderVersion.Latest;       // keep whatever the project already uses
        ExtraModuleNames.Add("MyGame");
    }
}
```

`DefaultBuildSettings` sets which engine version's default build settings the target keeps for backward compatibility. Epic warns that `Latest` always uses the current defaults "at the risk of introducing build errors while upgrading". Leave existing values alone unless the task is an engine upgrade.

Build configurations combine a state (`Debug`, `DebugGame`, `Development`, `Shipping`, `Test`) with a target type. The editor uses `Development` by default. If you build `Debug`, launch the editor with `-debug`.

## Config

`.ini` files have `[Section]` headings and `Key=Value` lines. Reflected classes use `[/Script/ModuleName.ClassName]` as the section name. Array operators: `+` appends if the value is missing, `.` appends even if present, `-` removes, and `!` clears. Load order (later files override earlier ones):

1. `Engine/Config/Base*.ini` and the engine's platform files
2. `<Project>/Config/Default<Category>.ini`, which is what you normally edit and commit
3. Engine and project platform overrides (`Config/<Platform>/<Platform><Category>.ini`)
4. User files: `User<Category>.ini` in the user's local app data folder, Documents folder and project `Config/`

Don't edit `Engine/Config` for project needs, because those files apply to every project that uses the engine install.

## Plugins

A plugin is a folder with a `.uplugin` descriptor. It can contain modules and, if `"CanContainContent": true`, assets as well. Dependencies flow only from a level to the same level or a higher one: project modules can depend on engine modules and plugins, but never the other way round. A plugin declares the other plugins it depends on in its own `.uplugin`.

## Version control

Epic's docs say `.uasset` and `.umap` files are binary and can't be merged with a text merge tool, so the editor's source-control workflow uses exclusive checkout (locking). If the repository uses Git, it usually tracks binary assets with Git LFS; follow whatever setup it already has. Don't commit generated folders or IDE project files. With **One File Per Actor**, the default under World Partition, each actor instance in a level is saved as its own external package. Many small binary files changing when a level is edited is normal.

## Sources

- https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-directory-structure
- https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/Projects/FProjectDescriptor
- https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-modules
- https://dev.epicgames.com/documentation/en-us/unreal-engine/module-properties-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/gameplay-modules-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-build-tool-target-reference
- https://dev.epicgames.com/documentation/en-us/unreal-engine/build-configurations-reference-for-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/configuration-files-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/plugins-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/using-perforce-as-source-control-for-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/one-file-per-actor-in-unreal-engine
