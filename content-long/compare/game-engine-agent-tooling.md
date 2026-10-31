---
id: game-engine-agent-tooling
type: comparison
title: "Game engine agent tooling compared: Unreal, Unity, Godot, Roblox and Bevy"
summary: "How a coding agent reaches into Unreal Engine, Unity, Godot, Roblox Studio and Bevy: the official MCP servers and CLIs, the main community servers, what each one runs on, how it is secured, how many tools it exposes and which ones are deprecated or inactive."
description: "Every major game engine now has a way for a coding agent to drive its editor, but the shapes differ: an MCP server built into the editor (Unreal, Roblox Studio), a vendor CLI that Unity now recommends over its own MCP server, community MCP servers with a sidecar process (Unity, Godot), a zero-sidecar Godot plugin, and a server for Bevy's remote protocol. This comparison sets them side by side on maintainer, engine versions, setup, transport and local security, tool surface, status and licence, using vendor docs, repos and package registries checked on 2026-10-31, plus headless tests of the three Godot servers."
author: Agentica Author
tags: [game-engine, gamedev, mcp, unreal-engine, unity, godot, roblox, bevy, editor-automation]
entries: [unreal-mcp, unity-cli, unity-mcp, godot-ai, godot-editor-mcp, beckett-godot-mcp, roblox-studio-mcp, bevy-brp-mcp, unity-ai-assistant-mcp, unity-skills, unreal-engine-claude-code-skills, runreal-unreal-mcp, chongdashu-unreal-mcp, unreal-python-api, godot-engine, bevy, model-context-protocol]
related: [drive-a-headless-godot-editor-over-mcp, unreal-engine-dev, agent-skill-packs-and-installers, bridge-stdio-and-remote-mcp-servers, test-your-mcp-server]
subjects: [unreal-mcp, unity-cli, unity-mcp, godot-ai, godot-editor-mcp, beckett-godot-mcp, roblox-studio-mcp, bevy-brp-mcp]
criteria:
  - Maintainer
  - Engine versions
  - Setup
  - Transport and local security
  - Tool surface
  - Status
  - Licence
rows:
  unreal-mcp:
    Maintainer: Epic Games (ModelContextProtocol plugin shipped with the engine)
    Engine versions: "Unreal Engine 5.8, marked Experimental"
    Setup: "Enable the plugin (needs All Toolsets), start with Auto Start Server or ModelContextProtocol.StartServer, then ModelContextProtocol.GenerateClientConfig writes the client config"
    Transport and local security: "HTTP and SSE at http://127.0.0.1:8000/mcp; loopback only, rejects non-loopback Origin, no authentication"
    Tool surface: "Toolsets written in Python or C++; Tool Search (on by default) exposes list_toolsets, describe_toolset and call_tool instead of every tool"
    Status: "Experimental in UE 5.8; tool calls run one at a time on the game thread"
    Licence: Part of Unreal Engine
  unity-cli:
    Maintainer: Unity Technologies
    Engine versions: "Pipeline package needs Unity 6.0 LTS or later"
    Setup: "Install the unity binary, then unity pipeline install; unity mcp configure <client> or unity setup claude / codex / grok / antigravity"
    Transport and local security: "Shell commands (unity command, unity eval) or an MCP mode; the pipeline server is localhost-only and works offline"
    Tool surface: "CLI commands plus MCP tools, filterable with unity mcp --tools / --exclude-tools globs"
    Status: "Experimental; 1.0.0-beta.14 (2026-10-21). Replaces the deprecated AI Assistant MCP server"
    Licence: "Free, no Unity AI subscription needed (licence not stated in the docs)"
  unity-mcp:
    Maintainer: "CoplayDev community project, not affiliated with Unity"
    Engine versions: "Unity 2021.3 LTS to 6.x; Python 3.10+ via uv"
    Setup: "Add the package from the git URL or OpenUPM, then Window > MCP for Unity > Configure All Detected Clients"
    Transport and local security: "Client over stdio or HTTP /mcp to a Python FastMCP server, which talks WebSocket to the C# Editor plugin; optional remote auth"
    Tool surface: "48 tool entrypoints with tool groups, multi-instance support and Roslyn validation"
    Status: "Active; v10.3.0 (2026-10-04), 15.5k stars"
    Licence: MIT
  godot-ai:
    Maintainer: hi-godot community project
    Engine versions: "Godot 4.7+; needs uv"
    Setup: "Install the editor plugin; its dock configures 26 clients, which connect through godot-ai attach (stdio)"
    Transport and local security: "Python server on authenticated HTTP port 8000 and WebSocket port 9500, both on loopback; a bare HTTP POST returned 401 in our test"
    Tool surface: "README: 46 tools and 120+ operations; attach listed 47 tools in our test"
    Status: "Active; v4.3.1 (2026-10-24), signed releases. Disabled in headless editors unless GODOT_AI_ALLOW_HEADLESS=1"
    Licence: MIT
  godot-editor-mcp:
    Maintainer: hybridindie community project
    Engine versions: "Godot 4.4+, validated on 4.7; Python 3.11+"
    Setup: "pip install godot-editor-mcp or uvx, plus the godot_mcp editor addon; godot-editor-mcp config --client <x> --write"
    Transport and local security: "stdio or HTTP on 127.0.0.1:9090; addon dials ws://127.0.0.1:9080 with an optional bridge token; foreign Host 421, foreign Origin 403; auth token required for non-loopback binds"
    Tool surface: "201 tools in 29 categories; only core and inspection are on by default (24 tools in our test), more via godot_enable_toolset"
    Status: "Active; 2026.10.20.1 on PyPI and GitHub"
    Licence: MIT
  beckett-godot-mcp:
    Maintainer: Beckett Lab (free Lite edition; paid Full edition)
    Engine versions: "Godot 4.2+ (4.4+ recommended)"
    Setup: "Copy the addon and enable it; it starts the server and writes .mcp.json itself"
    Transport and local security: "Streamable HTTP served by a GDScript plugin on 127.0.0.1:8770, no sidecar; per-project token in the URL path, exact Host and Origin checks"
    Tool surface: "Lite: 56 tools, 6 resources, 6 prompts; optional read-only mode, allowlist and destructive-call confirmation"
    Status: "Active; v1.16.0 (2026-10-06), 47 stars"
    Licence: "MIT (Lite); Full edition is a $15 one-time purchase"
  roblox-studio-mcp:
    Maintainer: "Roblox (built into Studio)"
    Engine versions: Current Roblox Studio
    Setup: "Assistant > Manage MCP Servers > Enable Studio as MCP server, then quick connect a client or point it at the StudioMCP command"
    Transport and local security: "Local process over stdio; every tool takes a studio_id, list_roblox_studios lists open instances"
    Tool surface: "Script read, edit, search and grep, Luau execution, play control, screen capture, input simulation, asset search and insert, mesh and material generation, subagents"
    Status: "Current; replaces the archived studio-rust-mcp-server"
    Licence: Part of Roblox Studio
  bevy-brp-mcp:
    Maintainer: "natepiano community project, not an official Bevy project"
    Engine versions: "Bevy 0.20 (crate 0.23.0); older crate versions map to Bevy 0.16 to 0.19"
    Setup: "cargo install bevy_brp_mcp, add it as a stdio server, and add RemotePlugin with the bevy_remote feature to the game"
    Transport and local security: "stdio to the agent; talks to the running game over the Bevy Remote Protocol (HTTP transport defaults to port 15702)"
    Tool surface: "Entities, components, resources, queries, hierarchy, type guide, app discovery and launch, logs; screenshots and input with bevy_brp_extras"
    Status: "Active; 0.23.0 (2026-10-09)"
    Licence: MIT OR Apache-2.0
verdict: "Use the engine vendor's path where one exists: Unreal MCP in UE 5.8, the Unity CLI in Unity 6 (not the deprecated AI Assistant MCP server) and Studio's built-in server in Roblox. On Unity versions before 6, CoplayDev's unity-mcp is the mature option. On Godot, pick Beckett for a no-sidecar plugin, Godot AI for the widest client setup, or Godot Editor MCP for the largest opt-in toolset. For Bevy, bevy_brp_mcp drives the running game."
last_verified: 2026-10-31
published: 2026-10-31
sources:
  - title: Unreal MCP in Unreal Editor (Epic docs)
    url: https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-mcp-in-unreal-editor
    accessed: 2026-10-31
  - title: Unreal Engine skills for Claude Code plugin (EpicGames)
    url: https://github.com/EpicGames/unreal-engine-skills-for-claude-code-plugin
    accessed: 2026-10-31
  - title: Unity CLI docs
    url: https://docs.unity.com/en-us/unity-cli
    accessed: 2026-10-31
  - title: "Unity CLI: replace the MCP server with the Unity CLI"
    url: https://docs.unity.com/en-us/unity-cli/replace-mcp-server-unity-cli
    accessed: 2026-10-31
  - title: Unity CLI release notes
    url: https://docs.unity.com/en-us/unity-cli/release-notes
    accessed: 2026-10-31
  - title: Use the Unity CLI
    url: https://docs.unity.com/en-us/unity-cli/use-unity-cli
    accessed: 2026-10-31
  - title: Unity AI Assistant 2.18 docs, Unity MCP overview (deprecation notice)
    url: https://docs.unity3d.com/Packages/com.unity.ai.assistant@2.18/manual/integration/unity-mcp-overview.html
    accessed: 2026-10-31
  - title: Unity AI Assistant 2.17 docs, Unity MCP overview (no deprecation notice)
    url: https://docs.unity3d.com/Packages/com.unity.ai.assistant@2.17/manual/integration/unity-mcp-overview.html
    accessed: 2026-10-31
  - title: Unity-Technologies/skills
    url: https://github.com/Unity-Technologies/skills
    accessed: 2026-10-31
  - title: CoplayDev/unity-mcp
    url: https://github.com/CoplayDev/unity-mcp
    accessed: 2026-10-31
  - title: CoplayDev/unity-mcp v10.3.0 release
    url: https://github.com/CoplayDev/unity-mcp/releases/tag/v10.3.0
    accessed: 2026-10-31
  - title: hi-godot/godot-ai
    url: https://github.com/hi-godot/godot-ai
    accessed: 2026-10-31
  - title: Godot AI server lifecycle (headless note)
    url: https://github.com/hi-godot/godot-ai/blob/main/docs/server-lifecycle.md
    accessed: 2026-10-31
  - title: hybridindie/godot-mcp (Godot Editor MCP)
    url: https://github.com/hybridindie/godot-mcp
    accessed: 2026-10-31
  - title: "PyPI: godot-editor-mcp"
    url: https://pypi.org/project/godot-editor-mcp/
    accessed: 2026-10-31
  - title: Coding-Solo/godot-mcp
    url: https://github.com/Coding-Solo/godot-mcp
    accessed: 2026-10-31
  - title: beckettlab/beckett-godot-mcp
    url: https://github.com/beckettlab/beckett-godot-mcp
    accessed: 2026-10-31
  - title: Roblox Studio MCP server (Creator docs)
    url: https://create.roblox.com/docs/studio/mcp
    accessed: 2026-10-31
  - title: Roblox/studio-rust-mcp-server (archived)
    url: https://github.com/Roblox/studio-rust-mcp-server
    accessed: 2026-10-31
  - title: bevy_brp_mcp README
    url: https://github.com/natepiano/bevy_brp/blob/main/mcp/README.md
    accessed: 2026-10-31
  - title: "crates.io: bevy_brp_mcp"
    url: https://crates.io/crates/bevy_brp_mcp
    accessed: 2026-10-31
  - title: "docs.rs: bevy_remote http module"
    url: https://docs.rs/bevy_remote/latest/bevy_remote/http/index.html
    accessed: 2026-10-31
  - title: runreal/unreal-mcp
    url: https://github.com/runreal/unreal-mcp
    accessed: 2026-10-31
  - title: chongdashu/unreal-mcp
    url: https://github.com/chongdashu/unreal-mcp
    accessed: 2026-10-31
---

The first agent bridges for game engines were community projects, such as the two Unreal servers below, which drive the editor over a TCP socket or Python remote execution. Now Epic and Roblox ship MCP servers inside their editors, Unity has moved from its own MCP server to a CLI, and Godot has three serious community servers. This page compares the current options for each engine. Every version, date and count was checked on 2026-10-31 against vendor docs, the repositories and the package registries. We also ran all three Godot servers against a headless Godot 4.7.2 editor; [Drive a headless Godot editor over MCP](guide:drive-a-headless-godot-editor-over-mcp) has the commands and results.

## Unreal Engine: Epic's plugin replaces the community bridges

[Unreal MCP](entry:unreal-mcp) is an Experimental plugin (`ModelContextProtocol`) in Unreal Engine 5.8. It depends on the All Toolsets plugin and enables the Toolset Registry. Turn on **Auto Start Server** in its settings or run `ModelContextProtocol.StartServer [port]` in the console. The server listens at `http://127.0.0.1:8000/mcp`. `ModelContextProtocol.GenerateClientConfig` takes `ClaudeCode`, `Cursor`, `VSCode`, `Gemini`, `Codex` or `All` and writes the client config for you. For CI or scripted launches there are the `-ModelContextProtocolStartServer` and `-ModelContextProtocolPort=N` command-line flags.

Points that matter for agent work:

- **Transports are HTTP and SSE only.** There is no stdio, so a client that only speaks stdio needs a bridge (see [Bridge stdio and remote MCP servers](guide:bridge-stdio-and-remote-mcp-servers)).
- **There is no authentication.** The server only accepts loopback connections and rejects non-loopback `Origin` headers. Epic's docs say it is not safe to expose beyond the local machine.
- **Tool Search is on by default.** `tools/list` returns three meta-tools (`list_toolsets`, `describe_toolset` and `call_tool`), and the agent discovers the real tools through them. This keeps a large toolset out of the context window, but agents that expect a flat list need a prompt nudge.
- **Calls run serially on the game thread.** Long tool calls block the editor.
- **You can add your own tools** in Python (`unreal.ToolsetDefinition` with `@toolset_registry.tool_call`) or C++ (`UToolsetDefinition` with `UFUNCTION(meta=(AICallable))`), and reload them with `ModelContextProtocol.RefreshTools`. MCP resources and prompts are not advertised.

Epic also publishes [Unreal Engine skills for Claude Code](entry:unreal-engine-claude-code-skills), an MIT plugin installed with `/plugin install unreal-engine-skills-for-claude-code@claude-plugins-official`. Its README describes "hundreds of tools … across 30+ toolsets". Our own [Unreal Engine development skill](skill:unreal-engine-dev) covers the build, test and editor-scripting side.

The two well-known community servers are both inactive. [runreal/unreal-mcp](entry:runreal-unreal-mcp) (MIT) drives the editor through Python Remote Execution and needs no extra plugin, but its last push was in June 2025 (npm 0.1.4). [chongdashu/unreal-mcp](entry:chongdashu-unreal-mcp) has 2.1k stars but no licence file (GitHub reports none, although the README badge says MIT), and its last push was in April 2025. For anything new on UE 5.8, start with Epic's plugin. On older engines, scripting through the [Unreal Python API](entry:unreal-python-api) is the maintained path.

## Unity: the CLI replaces Unity's own MCP server

The [Unity AI Assistant MCP server](entry:unity-ai-assistant-mcp) is deprecated. The notice first appears in the AI Assistant 2.18 docs ("Unity MCP server is deprecated. Use the Unity command-line interface (CLI) instead.") and is absent from the 2.17 docs.

The replacement is the [Unity CLI](entry:unity-cli), currently experimental at 1.0.0-beta.14 (2026-10-21). `unity pipeline install` adds the Pipeline package to a project (Unity 6.0 LTS or later). Then either:

- call the Editor from the shell with `unity command` and `unity eval`, which Unity's docs say are faster and use fewer tokens than MCP, or
- keep MCP: `unity mcp configure <client>` writes the config for claude, cursor, vscode or windsurf (`--list` shows the rest), and beta.14 adds `--tools` and `--exclude-tools` glob filters plus `--port`, `--pid` and `--instance` to pin a specific running Editor.

`unity setup claude`, `unity setup codex`, `unity setup grok` and `unity setup antigravity` do the per-agent setup in one step. The pipeline server listens on localhost only and works offline, and the CLI does not need a Unity AI subscription. Unity's docs say third-party MCP packages are unaffected by the deprecation. If you also run AI Assistant, use version 2.13 or later, which fixes a conflict with the CLI.

We could not install the CLI with the documented one-liner on 2026-10-31: the install script stopped with "Failed to fetch version manifest" because the stable manifest it requests returned 404. Its beta channel manifest did load. We did not get as far as an Editor, so the Unity rows come from Unity's docs only.

[Unity's skills](entry:unity-skills) repository (35 skills, Unity Companion License, `npx skills add Unity-Technologies/skills`) adds Unity-specific instructions for any agent that reads skills; see [Agent skill packs and installers](comparison:agent-skill-packs-and-installers).

The main community option is CoplayDev's [MCP for Unity](entry:unity-mcp), which is MIT, has 15.5k stars and was at v10.3.0 on 2026-10-04. It supports Unity 2021.3 LTS through 6.x, so it is the choice for projects that cannot move to Unity 6. The client talks stdio or HTTP to a Python FastMCP server (run by uv), which talks WebSocket to a C# Editor plugin. It exposes 48 tool entrypoints, with tool groups to trim them, and supports several Editor instances. It is not affiliated with Unity Technologies.

## Godot: three community servers with different designs

None of the three active Godot servers comes from the [Godot engine](entry:godot-engine) project itself; all are community plugins. We installed all three into fresh projects and drove a headless 4.7.2 editor with each.

- **[Godot AI](entry:godot-ai)** (MIT, v4.3.1) has the most polished setup. Its dock configures 26 clients, and clients connect through `godot-ai attach` over stdio. The plugin starts a Python server with authenticated HTTP on port 8000 and an authenticated WebSocket on port 9500, both on loopback. Because of that authentication, the README warns that a bare `http://127.0.0.1:8000/mcp` entry cannot authenticate, and our bare POST got 401. It needs Godot 4.7+ and uv, and it sends anonymous telemetry unless you set `GODOT_AI_DISABLE_TELEMETRY=true`. In a headless editor it stays off unless `GODOT_AI_ALLOW_HEADLESS=1` is set.
- **[Godot Editor MCP](entry:godot-editor-mcp)** (MIT, 2026.10.20.1 on PyPI) is a Python server (`pip install godot-editor-mcp`) plus an editor addon that dials it on `ws://127.0.0.1:9080`. It has 201 tools in 29 categories, but only core and inspection are enabled at first, so `tools/list` returned 24 tools for us. The agent turns on more with `godot_enable_toolset`. Mutating tools take `dry_run`. Its HTTP mode on 127.0.0.1:9090 answered a foreign `Host` header with 421 and a foreign `Origin` with 403, and it requires an auth token before it will bind to a non-loopback address.
- **[Beckett](entry:beckett-godot-mcp)** (MIT Lite edition, v1.16.0) has no sidecar at all. A GDScript editor plugin serves Streamable HTTP on `127.0.0.1:8770`, starts when the plugin is enabled, and writes `.mcp.json` for you. The per-project token is part of the URL path. It exposes 56 tools, 6 resources and 6 prompts, and validates scripts before writing them. In our test it refused a script with a parse error. Environment variables switch on read-only mode (`BECKETT_READONLY=1`), a tool allowlist or confirmation for destructive calls. A paid Full edition ($15 one-time) adds more tools, skill packs and playtesting.

Beckett is the least moving parts, Godot AI the easiest for a team on many clients, and Godot Editor MCP the most tools with the tightest default context.

The most-starred Godot server, [Coding-Solo/godot-mcp](https://github.com/Coding-Solo/godot-mcp) (MIT, about 6.4k stars), works differently. It is a Node.js server that launches the editor, runs projects, captures debug output and edits scenes. Its last push was in April 2026, so we left it out of the table.

## Roblox Studio: built in, stdio, multi-instance

[Roblox Studio's MCP server](entry:roblox-studio-mcp) is part of Studio. Enable it under Assistant > Manage MCP Servers > **Enable Studio as MCP server**. Quick connect covers Antigravity, Codex CLI, Claude Code, Claude Desktop, Cursor, Gemini CLI and VS Code. Any other client can run the local StudioMCP process over stdio: `/Applications/RobloxStudio.app/Contents/MacOS/StudioMCP` on macOS, or `cmd.exe /c %LOCALAPPDATA%\Roblox\mcp.bat` on Windows.

Every tool takes a `studio_id`, and `list_roblox_studios` returns the open Studio instances, so one agent can work across several places. The tools go well beyond editing scripts. They include `execute_luau`, `start_stop_play`, `screen_capture`, simulated keyboard and mouse input, asset search and insertion, mesh, material and procedural-model generation, and a `subagent` tool for exploring or playtesting. The earlier open-source studio-rust-mcp-server (MIT) is archived, and its README says it is no longer actively developed.

## Bevy: drive the running game

[Bevy](entry:bevy) games are plain Rust code, so agent tooling attaches to the running app rather than to an editor. [bevy_brp_mcp](entry:bevy-brp-mcp) is a stdio MCP server (`cargo install bevy_brp_mcp`) that speaks the Bevy Remote Protocol. Add `RemotePlugin` and enable Bevy's `bevy_remote` feature, and the agent can find, build and launch your apps and examples, then query and change entities, components and resources while the game runs. Bevy's HTTP transport for the protocol listens on port 15702 by default. The optional `bevy_brp_extras` plugin adds screenshots, keyboard, mouse and gamepad input, and diagnostics. Crate 0.23.0 targets Bevy 0.20. It is a community project, not an official Bevy one.

## Security notes that apply to all of them

- **Keep these servers on loopback.** Unreal's plugin has no authentication at all. Beckett and Godot AI use tokens, and Godot Editor MCP checks `Host` and `Origin`, but none of them is designed to be exposed to other machines. Run [Test your MCP server](guide:test-your-mcp-server)-style probes to confirm what an endpoint accepts before you trust it.
- **Don't commit generated client configs that hold secrets.** Beckett writes its token into `.mcp.json` and `.cursor/mcp.json`.
- **These tools can run arbitrary engine code.** Unreal toolsets run Python and C++, Roblox has `execute_luau`, and several Godot tools write and attach scripts. Treat an agent with these tools as having full access to the project and to the user account that runs the editor.
