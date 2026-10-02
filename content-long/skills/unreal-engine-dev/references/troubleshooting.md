# Troubleshooting compile, link, Live Coding and startup failures (UE 5.8)

Part of the `unreal-engine-dev` skill. Verified against the Unreal Engine 5.8 documentation on 2026-10-02. Lines marked *(general C++)* describe ordinary C++ toolchain behaviour rather than something Epic documents.

Always read the **first** error. UHT runs before the compiler, so a single UHT error can cause dozens of compiler errors after it.

## Symptom → cause → fix

| Symptom | Likely cause | Fix |
|---|---|---|
| `Cannot open include file` / `file not found` for an engine or plugin header | The module that owns the header isn't a dependency, or the include path is wrong | Add the module to `PublicDependencyModuleNames` (if the type appears in your public headers) or `PrivateDependencyModuleNames` in `<Module>.Build.cs`. Include it by its path under that module's `Public/` folder. If the module belongs to a plugin, enable the plugin in the `.uproject` |
| Unresolved external symbol (`LNK2019`/`LNK2001`) or `undefined reference` to another module's function or class | (a) The dependency is missing from `Build.cs`. (b) The symbol isn't exported | (a) Add the module dependency. (b) Mark the class or function `<MODULE>_API`. A `MinimalAPI` class exports only type information, so its non-inline functions can't be called from other modules |
| Unresolved symbol for something you just added in a **new** `.cpp` | UBT's cached makefile hasn't picked up the new file | Regenerate project files, or run UBT with `-gather` |
| Unresolved `Foo_Implementation` / `Foo_Validate`, or "function already has a body" | `BlueprintNativeEvent`, RPC and `WithValidation` functions need `Foo_Implementation` (and `Foo_Validate`) defined, **not** `Foo` | Define `Foo_Implementation(...)` in the `.cpp` and don't define `Foo`. Don't give a `BlueprintImplementableEvent` a C++ body |
| UHT error about `.generated.h` placement | The `#include "X.generated.h"` line isn't the last include | Move it to the end of the include block |
| UHT error about a missing `GENERATED_BODY`, or "class must be prefixed" | A reflected type is missing its macro or has the wrong name prefix | Add `GENERATED_BODY()`. Rename to `U`/`A`/`F`/`E`/`I` + Name, and add a Core Redirect if assets already reference the old name |
| A reflected member "disappears" under a custom `#if` | UHT ignores preprocessor blocks except `WITH_EDITOR` / `WITH_EDITORONLY_DATA` | Move the member out of the custom block, or use one of those two macros |
| Delegate-only header not processed | UBT sends a header to UHT only if it has UHT keywords | Put `UDELEGATE` above one of the delegates |
| The Game, Client or Server target fails but the editor target builds | Editor-only code or modules (`UnrealEd`, editor subsystems) are referenced from a `Runtime` module | Move the code to an `Editor`-type module, or wrap it in `#if WITH_EDITOR` and add editor dependencies only for editor builds |
| Errors appear only in non-unity builds or other configurations | Missing includes hidden by unity builds or shared PCHs | Include what you use. Make each `.cpp` include its own header first, then verify with unity builds and PCHs off (see `cli-build-test.md`) |
| Duplicate symbol or redefinition errors that appear only in unity builds | Two `.cpp` files in the same unity blob define `static` functions, anonymous-namespace symbols or macros with the same name *(general C++)* | Give file-local helpers unique names, or use a named namespace |
| `Unable to build while Live Coding is active. Exit the editor and game, or press Ctrl+Alt+F11 if iterating on code in the editor or game` | UBT detected an editor with a Live Coding session for this project | Either the user triggers Live Coding in the editor (Ctrl+Alt+F11), or the editor is closed and you build. Don't kill the user's editor without asking |
| Editor says modules are missing or out of date and offers to rebuild them on startup | Binaries are older than the source, or were built for another engine version | Build the `<Project>Editor` target for the engine named in `EngineAssociation`, then reopen. Plugins that ship binaries must match the engine version |
| Editor can't find C++ classes from a plugin at startup | The plugin module loads too late | Set the module's `LoadingPhase` to `PreDefault` in the `.uplugin` / `.uproject` |
| Blueprints lost property values or broke after a C++ rename | Saved assets reference the old names | Add `[CoreRedirects]` (`+ClassRedirects`, `+PropertyRedirects`, `+FunctionRedirects`, `+StructRedirects`, `+EnumRedirects`) to `Config/DefaultEngine.ini`. In a redirect, class and struct names drop their `U`/`A`/`F` prefix, but enum names keep their `E` |
| "Can't delete, asset in use" or a name collision after renaming | A leftover redirector | Fix up redirectors (`-run=ResavePackages -fixupredirects -projectonly -unattended`) |
| A crash or `nullptr` access on an object that "was just there" | Garbage collection freed an object that was only held by a raw pointer, or the actor was destroyed | Hold it in a `UPROPERTY` (`TObjectPtr`), `TWeakObjectPtr` or `TStrongObjectPtr`. Check with `IsValid()` |
| Shipping build lacks logs or console commands | That's by design: Shipping strips console commands, stats and profiling | Use the `Test` configuration for profiling. `bUseLoggingInShipping` is a target setting |

## Live Coding and hot reload

- Live Coding (built on Live++) is enabled by default. It patches the running editor, PIE session or attached desktop build when the user presses **Ctrl+Alt+F11**. It doesn't work on console or mobile builds. Settings are in Editor Preferences > General > Live Coding. If it's disabled, the editor falls back to the older Hot Reload.
- **Changing a default value in a constructor in the `.cpp` doesn't update existing instances during Live Coding.** Changing it in the header does.
- Structural changes (new `UPROPERTY`, `UFUNCTION`, `UCLASS`, `USTRUCT` or changed class layouts) depend on **Object Reinstancing**, which is on by default. Code that keeps pointers to reinstanced objects must refresh them via `ReloadReinstancingCompleteDelegate` / `ReloadCompleteDelegate`, or the editor can crash, notably on shutdown. Epic's MCP docs say that adding a new `UFUNCTION` needs a full editor restart. For anything beyond function-body edits, the reliable path is: save your work, close the editor, build the editor target and reopen.
- As an agent you usually can't press Ctrl+Alt+F11. If the editor is open, give the user the exact action ("press Ctrl+Alt+F11 in the editor", or "close the editor so I can build"), and don't report an unverified build as passing.

## Where to look

- Build output: the UBT console output. For editor-triggered builds, look in the Output Log and the Live Coding console.
- Editor and commandlet logs: `<Project>/Saved/Logs/`. The current run is `<Project>.log`, and older runs are kept beside it with timestamps. Crash reports go under `<Project>/Saved/` as well *(general UE behaviour)*.
- Automation results: the JSON and HTML under `-ReportExportPath`.

## Sources

- https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-modules
- https://dev.epicgames.com/documentation/en-us/unreal-engine/objects-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-header-tool-for-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/class-specifiers
- https://dev.epicgames.com/documentation/en-us/unreal-engine/ufunctions-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/include-what-you-use-iwyu-for-unreal-engine-programming
- https://dev.epicgames.com/documentation/en-us/unreal-engine/build-configuration-for-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/core-redirects-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/asset-redirectors-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-object-handling-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/using-live-coding-to-recompile-unreal-engine-applications-at-runtime
- https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-mcp-in-unreal-editor
- https://dev.epicgames.com/documentation/en-us/unreal-engine/build-configurations-reference-for-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-build-tool-target-reference
