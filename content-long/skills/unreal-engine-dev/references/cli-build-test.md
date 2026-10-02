# Headless build, cook, commandlets and automation tests (UE 5.8)

Part of the `unreal-engine-dev` skill. Verified against the Unreal Engine 5.8 documentation on 2026-10-02 unless a line says otherwise. Use absolute paths and quote them, because Windows engine paths often contain spaces.

## Where the tools are

| Tool | Windows | Linux | macOS |
|---|---|---|---|
| UBT wrapper | `Engine\Build\BatchFiles\Build.bat` | `Engine/Build/BatchFiles/Linux/Build.sh` | `Engine/Build/BatchFiles/Mac/Build.sh` |
| Automation Tool (UAT) | `Engine\Build\BatchFiles\RunUAT.bat` | `Engine/Build/BatchFiles/RunUAT.sh` | `Engine/Build/BatchFiles/RunUAT.sh` |
| Console editor (commandlets, tests) | `Engine\Binaries\Win64\UnrealEditor-Cmd.exe` | `Engine/Binaries/Linux/UnrealEditor-Cmd` | the `UnrealEditor` binary inside `Engine/Binaries/Mac/UnrealEditor.app` |
| Engine version | `Engine/Build/Build.version` (JSON) | same | same |

`UnrealEditor-Cmd` is the console variant of the editor, and Epic's examples use it for commandlets and Python scripts. On Linux, set up the toolchain with `Engine/Build/BatchFiles/Linux/SetupToolchain.sh` (in the Linux quickstart). Epic's UE 5.8 platform notes: on Windows, Visual Studio 2026 is recommended and VS 2022 17.14 is the minimum, with Windows SDK 10.0.26100.0 as the default. Linux uses clang 20.1.8. On macOS the minimum is Xcode 15.2.

## Build C++ with UnrealBuildTool

```bat
:: Windows: editor target for a project
"C:\Program Files\Epic Games\UE_5.8\Engine\Build\BatchFiles\Build.bat" MyGameEditor Win64 Development -Project="D:\Work\MyGame\MyGame.uproject" -WaitMutex
```

```bash
# Linux / macOS
"$UE/Engine/Build/BatchFiles/Linux/Build.sh" MyGameEditor Linux Development -Project="$PWD/MyGame.uproject" -WaitMutex
"$UE/Engine/Build/BatchFiles/Mac/Build.sh"   MyGameEditor Mac   Development -Project="$PWD/MyGame.uproject" -WaitMutex
```

- Arguments go in this order: target name, platform, configuration. The target names come from `Source/*.Target.cs`. The editor target is usually `<Project>Editor`. A `Game` target builds a standalone executable that needs cooked content to run. `Client` and `Server` builds work only if `<Project>Client.Target.cs` or `<Project>Server.Target.cs` exists.
- Configurations are `Debug`, `DebugGame`, `Development`, `Shipping` and `Test`. Editor targets support only `Debug`, `DebugGame` and `Development`.
- Visual Studio runs the same wrapper as `Build.bat <Target> Win64 <Config> -Project=... -WaitMutex -FromMsBuild`, so IDE builds and CLI builds behave the same. Epic's sanitizer page uses this form too, for example with `-EnableASan`, `-EnableTSan`, `-EnableUBSan` or `-EnableMSan` (Linux only) for Linux builds.
- UBT finds source files through `Build.cs` and `Target.cs`. **You don't need IDE project files to build.** Generate them only for an IDE or IntelliSense:
  - Source builds: run `GenerateProjectFiles.bat` or `.sh` in the engine root. Options include `<Project>.uproject -Game` (only that project), `-CurrentPlatform`, `-NoShippingConfigs` and `-Platforms=A+B`. On Linux, `GenerateProjectFiles.sh -vscode -project=<path>` generates a VS Code workspace.
  - Any build: in the editor, use File > Refresh Visual Studio Project. On Windows you can also right-click the `.uproject` and choose Generate Project Files.
- UBT caches "makefiles" for fast incremental builds. After you add or remove `.cpp` files, or headers with UObjects, regenerate project files or pass `-gather` to UBT so it picks up the change.
- UHT runs inside UBT automatically. You never need to run it yourself for normal work.

### Check include hygiene (IWYU)

IWYU is off by default for game projects and on for the engine. Modules that use `PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs` must include their own header first in every `.cpp` file. Unity builds and shared PCHs can hide missing includes. To find them, build once with unity builds and PCHs disabled. These are documented `BuildConfiguration` properties; put them in `<Project>/Saved/UnrealBuildTool/BuildConfiguration.xml`, then delete the file afterwards:

```xml
<?xml version="1.0" encoding="utf-8" ?>
<Configuration xmlns="https://www.unrealengine.com/BuildConfiguration">
  <BuildConfiguration>
    <bUseUnityBuild>false</bUseUnityBuild>
    <bUsePCHFiles>false</bUsePCHFiles>
  </BuildConfiguration>
</Configuration>
```

## Run the editor or game from the command line

General form: `<executable> [map URL] [flags]`.

- `UnrealEditor "<uproject>" /Game/Maps/MyMap?game=MyGameMode -game -log` runs the uncooked project as a game.
- `UnrealEditor "<uproject>" /Game/Maps/MyMap -server -port=7777 -log` starts a dedicated server, and `UnrealEditor "<uproject>" 127.0.0.1:7777 -game -log` connects a client to it.
- Useful documented flags: `-nullrhi` (no rendering, headless), `-unattended` (no dialogs or user input), `-stdout` (log to stdout), `-log`, `-ExecCmds="Cmd1;Cmd2"` (run console commands).
- To read your own flags in code, use `FParse::Param(FCommandLine::Get(), TEXT("myflag"))` for switches and `FParse::Value(FCommandLine::Get(), TEXT("mykey="), Value)` for key-value pairs.

## Commandlets

A commandlet is a headless editor mode: `UnrealEditor-Cmd "<uproject>" -run=<Name> [args]`. `<Name>` is the commandlet class name without the `U` prefix and the `Commandlet` suffix.

| Task | Command |
|---|---|
| Run a Python script without UI | `-run=pythonscript -script="<file.py or code>"` (the Python Editor Script Plugin must be enabled; levels aren't loaded automatically) |
| Fix up all redirectors | `-run=ResavePackages -fixupredirects -projectonly -unattended` (add `-autocheckout` to check files out of source control) |
| Cook content | `-run=cook -targetplatform=<Platform> [-iterate] [-map=A+B]` |
| Batch-call a function over many inputs **(5.8)** | `-run=BatchProcessCommandlet <Jobs.json>` (results go to `Saved/MultiprocessResults/results.txt`; `-numworkers=` and `-resultsfile=` control it) |
| Validate assets | the Data Validation commandlet, `-run=DataValidation` (refactored in 5.8) |
| Recompile all Blueprints (CI check) | `-run=CompileAllBlueprints`. This commandlet isn't on Epic's doc pages, but Epic staff discuss it on the UE 5.7 forums |

In UE 5.8, commandlets print their peak memory use when they finish, and the PythonScript commandlet enables source control before it runs the script.

## Cook, stage and package (UAT BuildCookRun)

BuildCookRun runs these stages: **build** (compile executables), **cook** (convert assets for the target platform), **stage** (copy to a staging directory), **package** (platform distribution format), **deploy** (to a device) and **run**.

```bash
# Minimal documented form
"$UE/Engine/Build/BatchFiles/RunUAT.sh" BuildCookRun -project="$PWD/MyGame.uproject" -clientconfig=Development
# Linux quickstart example
"$UE/Engine/Build/BatchFiles/RunUAT.sh" BuildCookRun -Build -Cook -Stage -Package -Run -Project=MyGame
# Turnkey alternative
"$UE/Engine/Build/BatchFiles/RunUAT.sh" Turnkey -command=ExecuteBuild -platform=Linux -Project=MyGame
```

Building BuildCookRun lines by hand is error-prone. Epic recommends creating a **custom launch profile in the Project Launcher** (Platforms > Project Launcher). The Output Log then prints the exact generated command (`Parsing Command Line: ... BuildCookRun ...`), and everything after `BuildCookRun` can be passed to `RunUAT` unchanged. Ask the user for that line when you need a production packaging command. Common extra flags include `-platform=Win64`, `-pak`, `-archive` and `-archivedirectory=<dir>`. Check them against the launcher output for your engine version, because Epic's pages don't list them.

## Automation tests

### Kinds of test

| Kind | Use for | How it's written |
|---|---|---|
| Simple or complex automation test | Unit and feature tests on engine-dependent code | `IMPLEMENT_SIMPLE_AUTOMATION_TEST` / `IMPLEMENT_COMPLEX_AUTOMATION_TEST` |
| Automation Spec | BDD-style tests, including latent and async ones | `DEFINE_SPEC` or `BEGIN_DEFINE_SPEC`/`END_DEFINE_SPEC` in `*.spec.cpp`, with `Describe()`, `It()`, `BeforeEach()` and `TestEqual`/`TestTrue` |
| Functional tests | Level-based gameplay tests | `AFunctionalTest` actors placed in a test map; needs the Functional Testing Editor plugin |
| CQTest, Automation Driver, screenshot comparison | Fixtures and async tests, input simulation, rendering checks | See Epic's Automation Test Framework page |
| Low-Level Tests | Pure unit tests that don't need the engine running | A separate framework (see Epic's Low-Level Tests docs) |

Minimal C++ test. By convention it goes in `Private/Tests/` inside the module:

```cpp
#include "Misc/AutomationTest.h"

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FMyGameMathTest, "MyGame.Math.Clamp",
    EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FMyGameMathTest::RunTest(const FString& Parameters)
{
    TestEqual(TEXT("Clamp upper"), FMath::Clamp(5, 0, 3), 3);
    return true; // returning false or logging an error fails the test
}
```

The second argument is the hierarchical pretty name you filter on. `RunTest` returns true to pass. Queue work across frames with `ADD_LATENT_AUTOMATION_COMMAND`, and define custom latent commands with `DEFINE_LATENT_AUTOMATION_COMMAND`. Epic says Smoke tests should finish within one second.

### Run tests headless

```bash
"$UE/Engine/Binaries/Linux/UnrealEditor-Cmd" "$PWD/MyGame.uproject" \
  -ExecCmds="Automation RunTest MyGame.Math;Quit" \
  -unattended -nullrhi -stdout -ReportExportPath="$PWD/Saved/TestReport"
```

- Filters: `Automation RunTest Test1+Test2`, `Automation RunTest MySet.MySubSet` (everything under that section) and `Automation RunTest Group:MyGroup`.
- Define groups and exclusions in `Config/DefaultEngine.ini` with `+Groups=(Name="Group1", Filters=((Contains=".Some String.")))` and `+ExcludeTest=(Test="...",Reason="...",Warn=False)`. Excluded tests are reported as Skipped.
- `-ReportExportPath=<dir>` writes a JSON report with HTML files. `-ResumeRunTest`, used with it, resumes after a crash. The JSON report is the reliable source for pass and fail results, so parse it or the log instead of trusting the exit code.
- Before running a plugin's tests, enable that plugin (and Functional Testing Editor for functional tests).
- To test packaged builds or multi-process sessions (for example a server plus several clients) across platforms, use the Gauntlet framework.

## Sources

- https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-build-tool-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/compiling-game-projects-in-unreal-engine-using-cplusplus
- https://dev.epicgames.com/documentation/en-us/unreal-engine/build-configurations-reference-for-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/build-configuration-for-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/how-to-generate-unreal-engine-project-files-for-your-ide
- https://dev.epicgames.com/documentation/en-us/unreal-engine/include-what-you-use-iwyu-for-unreal-engine-programming
- https://dev.epicgames.com/documentation/en-us/unreal-engine/using-clang-sanitizers-in-unreal-engine-projects
- https://dev.epicgames.com/documentation/en-us/unreal-engine/linux-development-quickstart-for-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/command-line-arguments-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-command-line-arguments-reference
- https://dev.epicgames.com/documentation/en-us/unreal-engine/build-operations-cooking-packaging-deploying-and-running-projects-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/cooking-content-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/asset-redirectors-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/scripting-the-unreal-editor-using-python
- https://dev.epicgames.com/documentation/en-us/unreal-engine/automation-test-framework-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/write-cplusplus-tests-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/automation-spec-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/functional-testing-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/run-automation-tests-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/configure-automation-tests-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/gauntlet-automation-framework-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-5-8-release-notes
- https://forums.unrealengine.com/t/intermittent-crash-when-running-compile-all-blueprints-commandlet/2708050
