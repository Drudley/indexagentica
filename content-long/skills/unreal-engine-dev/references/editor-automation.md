# Changing assets without hand-editing binaries: Python, commandlets and Unreal MCP (UE 5.8)

Part of the `unreal-engine-dev` skill. Verified against the Unreal Engine 5.8 documentation and the Python API reference on 2026-10-02.

`.uasset` and `.umap` files are binary. The only safe ways to change them are the editor and its scripting surfaces, which are described below. Before running a script that modifies many assets, tell the user what will change, work on a clean source-control state, and keep the scope tight.

## Python editor scripting

- **Enabling it.** Python comes from the **Python Editor Script Plugin**, which you enable separately in each project (Edit > Plugins > Scripting). Enable **Editor Scripting Utilities** as well. The plugin embeds Python **3.11.8** in UE 5.8. Epic marks Python scripting as **Experimental**.
- **Editor only.** Python isn't available in PIE, standalone games or cooked builds, so it can't be used for gameplay.
- **API.** The `unreal` module reflects everything exposed to Blueprints, including your own `BlueprintCallable` C++ and functions from enabled plugins. Names are converted to `snake_case`, and enum values to `UPPER_SNAKE_CASE`. Reference: https://dev.epicgames.com/documentation/en-us/unreal-engine/python-api
- **Running scripts:**
  - In the editor console's Python mode, or with `py "C:\path\script.py"` from the Cmd console.
  - Headless, without loading a level: `UnrealEditor-Cmd "<uproject>" -run=pythonscript -script="<file or code>"`. The script must load any level it needs, for example `unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).load_level("/Game/Maps/MyMap")`.
  - Full editor, which runs the script after the startup level loads and then exits: `UnrealEditor-Cmd "<uproject>" -ExecutePythonScript="<file>"`. This needs Editor Scripting Utilities. Epic advises against running `py` through `-ExecCmds` at startup, because it can run before the editor is ready.
  - `init_unreal.py` in any `Content/Python` folder runs automatically at editor startup. Project Settings > Plugins > Python > Startup Scripts run after the default level loads.
- **Script search paths.** `Content/Python` in the project, the engine and each enabled plugin, plus `Documents/UnrealEngine/Python`. Add more with the `UE_PYTHONPATH` environment variable or the Additional Paths project setting.

### Rules for Python scripts

1. **Never use `os.rename`, `shutil.move` or file deletes on assets.** Use `unreal.EditorAssetLibrary` (`rename_asset`, `duplicate_asset`, `delete_asset`, `save_asset`, `list_assets`, `find_package_referencers_for_asset`, `checkout_asset`, ...) or `unreal.AssetTools`.
2. **Set properties with `obj.set_editor_property("name", value)`** rather than assigning the attribute directly. It runs the same pre-edit and post-edit logic as the Details panel.
3. **Group changes with `with unreal.ScopedEditorTransaction("Describe change"):`** so the user can undo them in one step. Some operations, such as imports, can't be undone.
4. **Show progress on long jobs with `unreal.ScopedSlowTask`, and check `should_cancel()`.** The editor UI is blocked while a script runs.
5. Log with `unreal.log`, `unreal.log_warning` and `unreal.log_error`. `print` goes to `unreal.log`.
6. Save explicitly (`unreal.EditorAssetLibrary.save_asset(path)` or `save_loaded_asset`). Unsaved changes are lost when a commandlet exits.

### Editing Blueprints from Python (5.8)

UE 5.8 "greatly expanded" the Blueprint editor scripting API:

- `unreal.BlueprintEditorLibrary` has static helpers. Examples: `create_blueprint_asset_with_parent`, `add_member_variable`, `add_function_graph`, `add_event_override`, `add_function_override`, `find_event_graph`, `list_functions`, `list_member_variable_names`, `reparent_blueprint`, `replace_variable_references`, `remove_unused_nodes`, `compile_blueprint` and `generated_class`.
- `unreal.BlueprintGraphEditor` is an object-oriented graph editor. You get one from `create_and_edit_function_graph(bp, name)` or `get_graph_editor(...)`, then use it to add nodes (`add_call_function_node("/Script/Engine.KismetSystemLibrary.PrintString")`, `add_branch_node`, `add_custom_event_node`, ...) and wire pins (`find_input_pin(...).set_pin_value(...)`, `try_create_connection(...)`).
- Explore it in the editor's Python console with `help(unreal.BlueprintGraphEditor)` and `help(unreal.BlueprintEditorLibrary)`. The API is newer than the rest, so call `compile_blueprint` after every edit, check the log for compile errors, and save. In engines older than 5.8, many of these functions don't exist.

### Batch processing (5.8)

The batch processor runs a registered Python or C++ function across large sets of inputs, in parallel worker processes: `UnrealEditor "<uproject>" -run=BatchProcessCommandlet <Jobs.json>`. You can also start it from script with `BatchProcessLibrary::RunBatch`. Python classes used this way must be registered with `@unreal.uclass()` and `@unreal.ufunction(...)`, and imported from `init_unreal.py`. The 5.8 release notes have a full example.

## Redirectors after moves and renames

Moving or renaming an asset leaves a **redirector** at the old path so that unloaded referencers can still find it. To clean them up, right-click > Fixup in the Content Browser, or run:

```bash
UnrealEditor-Cmd "<uproject>" -run=ResavePackages -fixupredirects -projectonly -unattended   # add -autocheckout with Perforce
```

Fix redirectors before deleting or re-creating assets with the same name. Otherwise you get "in use" or name-collision errors.

## Unreal MCP (UE 5.8, Experimental)

Epic's **Unreal MCP** plugin embeds an MCP server in the editor process, so MCP clients such as Claude Code, Cursor or the MCP Inspector can drive the editor. Epic warns that "many features are incomplete or missing" and that APIs can change. The plugin's identifier is `ModelContextProtocol`.

**Setup**

1. Enable **Unreal MCP** and **All Toolsets** in Edit > Plugins. **Toolset Registry** is enabled automatically. Then restart the editor.
2. Start the server. Either turn on Editor Preferences > General > Model Context Protocol > Auto Start Server, run `ModelContextProtocol.StartServer [port]` in the console, or launch the editor with `-ModelContextProtocolStartServer` (which also works for commandlets) and optionally `-ModelContextProtocolPort=N`.
3. Write the client config with the console command `ModelContextProtocol.GenerateClientConfig <ClaudeCode|Cursor|VSCode|Gemini|Codex|All>`. For Claude Code this writes `.mcp.json` in the project root with `{"mcpServers": {"unreal-mcp": {"type": "http", "url": "http://127.0.0.1:8000/mcp"}}}`. JSON configs are merged. The Codex TOML config is write-once, so delete a stale one by hand first.
4. Launch the agent from the folder where the config was written (the project root for installed builds, the workspace root for source builds), after the editor is running.

**Behaviour you must respect**

- The server binds to `127.0.0.1:8000` at `/mcp`, uses HTTP with SSE (stdio and WebSocket aren't supported) and has **no authentication**. Epic says it isn't safe to expose beyond the local machine, and it rejects non-loopback `Origin` headers. Never tunnel or port-forward it.
- **Tool calls run one at a time on the game thread.** Don't send overlapping calls.
- Tool search is on by default. `tools/list` returns only `list_toolsets`, `describe_toolset` and `call_tool`, so look up a toolset's schema with `describe_toolset` before calling its tools. The shipped toolsets include SceneTools, ActorTools, MaterialInstanceTools and ObjectTools. In 5.8 they cover actors, lighting, material instances, Slate inspection and running automation tests, plus an animation toolset.
- Resources and prompts aren't provided by any shipping toolset.
- After authoring or Live Coding a toolset, run `ModelContextProtocol.RefreshTools` and reconnect the client. A **new** C++ `UFUNCTION` tool needs a full editor restart.
- Debug with the `LogModelContextProtocol` log category (`Log LogModelContextProtocol Verbose`) or the MCP Inspector (`npx @modelcontextprotocol/inspector`) pointed at `http://127.0.0.1:8000/mcp` over Streamable HTTP.
- Prefer **5.8.1 or later**. The 5.8.1 notes list MCP fixes, including `tools/call` response framing and a crash when the assistant edited certain Blueprints. They also note that changes the assistant makes during a script are no longer bundled into a single undo transaction.

**Adding tools.** Derive a class from `unreal.ToolsetDefinition` in Python, under any plugin's `Content/Python/`, decorate it with `@unreal.uclass()`, and give it `@staticmethod` functions decorated with `@toolset_registry.tool_call`. Type hints and Google-style docstrings become the JSON schema. In C++, derive from `UToolsetDefinition` with `UCLASS(BlueprintType, Hidden)` and add `static UFUNCTION(meta=(AICallable))` functions. Mark functions you want hidden with `meta=(AIIgnore)`. For dynamic tools, implement `IModelContextProtocolTool` and register it with `IModelContextProtocolModule::GetChecked().AddTool(...)`.

### Community alternatives (unofficial)

Use these only when the user wants them, for example on engines older than 5.8. They aren't Epic projects, and each gives an agent broad control of the editor.

- `runreal/unreal-mcp` (MIT, Node.js via `npx`) drives the editor through Unreal's built-in Python remote execution. It needs the Python Editor Script Plugin and Remote Execution turned on in Project Settings, and it states support for UE 5.4+. Last repository push: 2025-06-06. https://github.com/runreal/unreal-mcp
- `chongdashu/unreal-mcp` (UE 5.5+, Python 3.12+) pairs a C++ plugin on TCP port 55557 with a Python MCP server. It's marked Experimental, and the repository hasn't been pushed to since 2025-04-22. https://github.com/chongdashu/unreal-mcp

Epic also offers the **Epic Developer Assistant**, a chat assistant for humans that answers documentation questions and generates code. According to Epic's announcement it is integrated in the editor from UE 5.7. It isn't an agent API.

## Sources

- https://dev.epicgames.com/documentation/en-us/unreal-engine/scripting-the-unreal-editor-using-python
- https://dev.epicgames.com/documentation/en-us/unreal-engine/python-api/class/BlueprintGraphEditor?application_version=5.8
- https://dev.epicgames.com/documentation/en-us/unreal-engine/python-api/class/BlueprintEditorLibrary?application_version=5.8
- https://dev.epicgames.com/documentation/en-us/unreal-engine/python-api/class/EditorAssetLibrary?application_version=5.8
- https://dev.epicgames.com/documentation/en-us/unreal-engine/asset-redirectors-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-5-8-release-notes
- https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-mcp-in-unreal-editor
- https://forums.unrealengine.com/t/unreal-engine-5-8-released/2729274
- https://forums.unrealengine.com/t/the-epic-developer-assistant-ai-powered-developer-assistant-for-unreal-engine-5-6/2659525
- https://github.com/runreal/unreal-mcp
- https://github.com/chongdashu/unreal-mcp
