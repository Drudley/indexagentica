---
id: drive-a-headless-godot-editor-over-mcp
type: guide
title: Drive a headless Godot editor over MCP
summary: "Run a Godot 4.7 editor with no display on a Linux box or CI runner and let a coding agent edit scenes and scripts through Beckett, Godot Editor MCP or Godot AI. Includes tested commands, a stdlib Python probe, and the security checks we ran."
description: "Coding agents often run on machines with no screen: a CI runner, a container or a remote dev box. Godot's editor runs headless, and its MCP plugins mostly keep working. This guide installs Godot 4.7.2 on Linux, then connects three community MCP servers (Beckett, Godot Editor MCP and Godot AI) to a headless editor. For each one it gives the exact setup, the tool calls we made to create a node, write or attach a script and save the scene, what landed on disk, and how the server reacted to missing tokens and foreign Host or Origin headers. It also covers the settings that differ in headless mode and what not to commit."
author: Agentica Author
difficulty: intermediate
time_estimate: 40 min
prerequisites:
  - A Linux x86_64 machine (no display needed)
  - Python 3.11+ for Godot Editor MCP and for the probe script
  - uv, for Godot AI
  - An MCP client, or the probe script below
tags: [godot, game-engine, gamedev, mcp, headless, ci, testing, editor-automation]
entries: [godot-engine, beckett-godot-mcp, godot-editor-mcp, godot-ai, model-context-protocol, claude-code, cursor]
related: [game-engine-agent-tooling, test-your-mcp-server, add-mcp-servers-to-claude-code, bridge-stdio-and-remote-mcp-servers]
sources:
  - title: Godot 4.7.2-stable release assets
    url: https://github.com/godotengine/godot/releases/tag/4.7.2-stable
    accessed: 2026-10-31
  - title: beckettlab/beckett-godot-mcp README
    url: https://github.com/beckettlab/beckett-godot-mcp
    accessed: 2026-10-31
  - title: Beckett v1.16.0 release
    url: https://github.com/beckettlab/beckett-godot-mcp/releases/tag/v1.16.0
    accessed: 2026-10-31
  - title: hybridindie/godot-mcp README (Godot Editor MCP)
    url: https://github.com/hybridindie/godot-mcp
    accessed: 2026-10-31
  - title: Godot Editor MCP environment variable reference
    url: https://github.com/hybridindie/godot-mcp/blob/main/docs/site/reference-env-vars.md
    accessed: 2026-10-31
  - title: "PyPI: godot-editor-mcp"
    url: https://pypi.org/project/godot-editor-mcp/
    accessed: 2026-10-31
  - title: hi-godot/godot-ai README
    url: https://github.com/hi-godot/godot-ai
    accessed: 2026-10-31
  - title: Godot AI v4.3.1 release
    url: https://github.com/hi-godot/godot-ai/releases/tag/v4.3.1
    accessed: 2026-10-31
  - title: Godot AI server lifecycle
    url: https://github.com/hi-godot/godot-ai/blob/main/docs/server-lifecycle.md
    accessed: 2026-10-31
  - title: "MCP specification: Streamable HTTP transport"
    url: https://modelcontextprotocol.io/specification/2025-06-18/basic/transports
    accessed: 2026-10-31
last_verified: 2026-10-31
published: 2026-10-31
---

A coding agent on a CI runner or a remote box has no screen, but Godot's editor does not need one. Start it with `--headless --editor` and its editor plugins still load, so an MCP server inside or beside the editor can open scenes, add nodes and write scripts. This guide sets that up with the three active community servers compared in [Game engine agent tooling compared](comparison:game-engine-agent-tooling): [Beckett](entry:beckett-godot-mcp), [Godot Editor MCP](entry:godot-editor-mcp) and [Godot AI](entry:godot-ai).

Everything below was run on 2026-10-31 on a Linux x86_64 box with no display, using Godot 4.7.2-stable, Beckett Lite 1.16.0, Godot Editor MCP 2026.10.20.1 and Godot AI 4.3.1.

## 1. Install Godot and make a project

Download the official Linux build and check it against the release's SHA512 list:

```bash
mkdir -p ~/godot && cd ~/godot
curl -LO https://github.com/godotengine/godot/releases/download/4.7.2-stable/Godot_v4.7.2-stable_linux.x86_64.zip
curl -LO https://github.com/godotengine/godot/releases/download/4.7.2-stable/SHA512-SUMS.txt
grep 'Godot_v4.7.2-stable_linux.x86_64.zip' SHA512-SUMS.txt | sha512sum -c -
unzip -q Godot_v4.7.2-stable_linux.x86_64.zip
ln -sf "$PWD/Godot_v4.7.2-stable_linux.x86_64" ~/godot/godot
```

Each server below gets its own small project. A project only needs `project.godot`, so you can create one without the project manager. The `[editor_plugins]` section is what the Plugins tab writes when you tick a plugin:

```bash
mkdir demo && cd demo
cat > project.godot <<'CFG'
config_version=5

[application]
config/name="demo"
config/features=PackedStringArray("4.7")

[editor_plugins]
enabled=PackedStringArray("res://addons/PLUGIN/plugin.cfg")
CFG
printf '[gd_scene format=3]\n\n[node name="Main" type="Node2D"]\n' > main.tscn
```

Replace `PLUGIN` with the addon folder: `beckett`, `godot_mcp` or `godot_ai`. Then start the editor in the background:

```bash
~/godot/godot --headless --editor --path . > editor.log 2>&1 &
```

## 2. A probe to drive any server

Most clients can connect to these servers, but a small script gives you the same check in CI with no client installed. This one uses only the Python standard library. It speaks Streamable HTTP, handles both JSON and SSE replies, keeps the `Mcp-Session-Id`, lists the tools, then runs the calls you pass as `name={json}`:

```python
# mcp_probe.py: initialize, list tools, then call tools in one session
import json, sys, urllib.request, urllib.error

def rpc(url, method, params=None, id_=1, sid=None):
    body = {"jsonrpc": "2.0", "method": method}
    if id_ is not None:
        body["id"] = id_
    if params is not None:
        body["params"] = params
    h = {"Content-Type": "application/json", "Accept": "application/json, text/event-stream"}
    if sid:
        h["Mcp-Session-Id"] = sid
    req = urllib.request.Request(url, json.dumps(body).encode(), h)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            raw, sid, status = r.read().decode(), r.headers.get("Mcp-Session-Id") or sid, r.status
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:200], sid
    if raw.startswith(("event:", "data:")):
        msgs = [json.loads(l[5:]) for l in raw.splitlines() if l.startswith("data:") and l[5:].strip()]
        match = [m for m in msgs if m.get("id") == id_]
        return status, (match or msgs or [None])[0], sid
    return status, (json.loads(raw) if raw.strip() else None), sid

url = sys.argv[1]
st, res, sid = rpc(url, "initialize", {"protocolVersion": "2025-06-18", "capabilities": {},
                   "clientInfo": {"name": "probe", "version": "0"}})
print("initialize", st, res if isinstance(res, str) else res["result"]["serverInfo"])
if st != 200:
    sys.exit(1)
rpc(url, "notifications/initialized", id_=None, sid=sid)
st, res, sid = rpc(url, "tools/list", {}, 2, sid)
print("tools", len(res["result"]["tools"]))
for i, call in enumerate(sys.argv[2:], start=10):
    name, _, args = call.partition("=")
    st, res, sid = rpc(url, "tools/call", {"name": name, "arguments": json.loads(args or "{}")}, i, sid)
    print(name, json.dumps(res["result"]["content"])[:300])
```

For Godot AI, whose clients connect over stdio, the same loop works over a subprocess's stdin and stdout: write one JSON-RPC message per line and read lines until the reply with your `id` arrives.

## 3. Beckett: a server inside the editor

Beckett's free Lite edition is a pure GDScript plugin: the editor itself serves MCP, with no Python or Node process. Unzip the release into the project so it lands in `addons/beckett/`, set `PLUGIN` to `beckett`, and start the editor:

```bash
curl -LO https://github.com/beckettlab/beckett-godot-mcp/releases/download/v1.16.0/beckett-godot-mcp-lite-v1.16.0.zip
unzip -q beckett-godot-mcp-lite-v1.16.0.zip     # creates addons/beckett/
~/godot/godot --headless --editor --path . > editor.log 2>&1 &
```

Within about 20 seconds the plugin had started on `127.0.0.1:8770` and written three things to the project:

- `.mcp.json` and `.cursor/mcp.json`, each with an `http` server whose URL is `http://127.0.0.1:8770/mcp/<token>`. The 32-hex-character token is part of the path.
- `.beckett/port` and `.beckett/token`.
- A `BeckettRuntime` autoload in `project.godot`.

The server reported itself as `beckett-godot-mcp` 1.16.0, advertised tools, resources and prompts, and listed 56 tools. This sequence built a scene:

```bash
TOKEN=$(cat .beckett/token)
python3 mcp_probe.py "http://127.0.0.1:8770/mcp/$TOKEN" \
  'open_scene={"path":"res://main.tscn"}' \
  'create_node={"type":"Sprite2D","name":"Player"}' \
  'write_script={"path":"res://player.gd","content":"extends Sprite2D\nfunc _ready(:\n\tpass\n"}' \
  'write_script={"path":"res://player.gd","content":"extends Sprite2D\n\nfunc _ready():\n\tprint(\"ready\")\n"}' \
  'attach_script={"target":"Player","path":"res://player.gd"}' \
  'save_scene={}'
```

The first `write_script` has a syntax error on purpose. Beckett refused it with "Refusing to write: script does not compile", plus the engine's parse error, and wrote nothing. The second one returned `disk_verified: true`. After `save_scene`, `main.tscn` on disk had a `Player` Sprite2D with `player.gd` attached as an external resource. In headless mode, `save_scene` also reported an engine error from the dummy renderer's texture storage. The save still succeeded, so that error can be ignored.

Security checks against the same server:

| Request | Result |
|---|---|
| `POST /mcp` without the token in the path | 401 |
| Correct URL, `Origin: http://evil.example` | 403 |
| Correct URL, `Host: attacker.example:8770` | 403 |
| Listening sockets | 127.0.0.1 only |

For a shared or CI machine, the README documents `BECKETT_READONLY=1` (inspection only), `BECKETT_ALLOWLIST` (limit the tools) and `BECKETT_CONFIRM_DESTRUCTIVE=1`, as well as `BECKETT_PORT` and `BECKETT_TOKEN`.

## 4. Godot Editor MCP: a Python server the editor dials into

Godot Editor MCP splits the work. A Python server talks MCP to the client, and an editor addon connects out to that server over a WebSocket on `127.0.0.1:9080`. Install the server, unzip the addon from the matching GitHub release, set `PLUGIN` to `godot_mcp`, and give both processes the same bridge token. The token is optional, but without it any local process could pose as the editor:

```bash
python3 -m venv .venv && .venv/bin/pip install godot-editor-mcp==2026.10.20.1
curl -LO https://github.com/hybridindie/godot-mcp/releases/download/2026.10.20.1/godot_mcp_addon.zip
unzip -q godot_mcp_addon.zip                     # creates addons/godot_mcp/
export GODOT_MCP_BRIDGE_TOKEN=$(python3 -c 'import secrets; print(secrets.token_hex(16))')
GODOT_MCP_TRANSPORT=http .venv/bin/godot-editor-mcp > server.log 2>&1 &
~/godot/godot --headless --editor --path . > editor.log 2>&1 &
```

The server log showed the bridge on `127.0.0.1:9080`, MCP on `http://127.0.0.1:9090/mcp`, and then "bridge peer authenticated" when the editor connected. For a desktop client, use stdio, which is the default transport, and let `godot-editor-mcp config --client <client> --write` write the client config. `godot-editor-mcp doctor --project <path>` checks a setup.

Only the core and inspection toolsets are on at first, so `tools/list` returned 24 tools. The agent enables more as it needs them:

```bash
python3 mcp_probe.py http://127.0.0.1:9090/mcp \
  'godot_enable_toolset={"category":"scene_edit"}' \
  'godot_scene_edit_open_scene={"scene_path":"res://main.tscn"}' \
  'godot_scene_edit_create_node={"parent_path":".","node_type":"Camera2D","node_name":"Cam","dry_run":true}' \
  'godot_scene_edit_create_node={"parent_path":".","node_type":"Camera2D","node_name":"Cam"}' \
  'godot_scene_edit_save_scene={}'
```

After `scene_edit` was enabled, the list grew to 48 tools. The setting also persisted for a new session against the same server. The dry run returned `created: false`, the real call returned `created: true`, and the saved `main.tscn` contained the `Cam` Camera2D. With the default `GODOT_MCP_HTTP_HOST_ORIGIN_PROTECTION=auto`, a foreign `Host` header got 421 and a foreign `Origin` got 403. If you bind HTTP to a non-loopback address, the server refuses to start unless `GODOT_MCP_AUTH_TOKEN` is set.

One gotcha: `godot-editor-mcp --help` does not print help. It starts the server.

## 5. Godot AI: set the headless opt-in

Godot AI's plugin starts a Python server (through `uvx`) with authenticated HTTP on port 8000 and an authenticated WebSocket on port 9500. Clients connect through `godot-ai attach` over stdio. Unzip the release's `godot-ai-v4-plugin.zip` (it creates `addons/godot_ai/`) and set `PLUGIN` to `godot_ai`.

Started headless like the others, the editor log said `MCP | plugin disabled in headless mode` and nothing listened. The README's section on headless editors says normal headless launches skip the server, and to set `GODOT_AI_ALLOW_HEADLESS=1` only for intentional CI or editor sessions:

```bash
curl -LO https://github.com/hi-godot/godot-ai/releases/download/v4.3.1/godot-ai-v4-plugin.zip
unzip -q godot-ai-v4-plugin.zip                  # creates addons/godot_ai/
GODOT_AI_ALLOW_HEADLESS=1 GODOT_AI_DISABLE_TELEMETRY=true \
  ~/godot/godot --headless --editor --path . > editor.log 2>&1 &
```

With the variable set, the plugin started `godot-ai==4.3.1` with `--transport streamable-http --port 8000 --ws-port 9500`, connected and authenticated. Both ports listened on 127.0.0.1 only. It also added a `_mcp_game_helper` autoload to `project.godot`. `GODOT_AI_DISABLE_TELEMETRY=true` opts out of the anonymous telemetry that Godot AI otherwise sends.

A bare `POST http://127.0.0.1:8000/mcp` got 401 with `TRANSPORT_AUTH_REQUIRED`, as the README warns. Through `attach`, which handles the authentication, a stdio session listed 47 tools and ran this sequence:

```text
command: uvx --from godot-ai==4.3.1 godot-ai attach --disable-telemetry
editor_state         -> godot_version "4.7.2-stable (official)"
scene_open           {"path": "res://main.tscn"}
node_create          {"type": "Label", "name": "Hello"}   -> path /Main/Hello, undoable true
scene_save           {}                                   -> res://main.tscn
scene_get_hierarchy  {}                                   -> Main (Node2D), Hello (Label)
```

`main.tscn` on disk then held the `Hello` Label. When we killed the editor, the plugin-started server was gone within 8 seconds, so you do not need to clean it up yourself.

## 6. Use it from an agent

On a headless box, point the agent's MCP config at the same endpoints. For Claude Code (see [Add MCP servers to Claude Code](guide:add-mcp-servers-to-claude-code)), Beckett's generated `.mcp.json` in the project root is picked up as a project-scoped server. For the others:

```bash
claude mcp add --transport http godot-editor http://127.0.0.1:9090/mcp
claude mcp add godot-ai -- uvx --from godot-ai==4.3.1 godot-ai attach --disable-telemetry
```

Start the editor before the agent session, and in CI wait for the port (`8770`, `9090` or `8000`) to accept connections before the first call. All three need a running editor with the plugin loaded; Beckett and Godot AI have nothing to serve before that.

## 7. Keep it safe

- **Don't commit what the plugins generate.** Beckett's `.mcp.json`, `.cursor/mcp.json` and `.beckett/` hold the project token. Add them to `.gitignore` unless every collaborator should share that token.
- **Review the autoloads.** Beckett and Godot AI both added an autoload to `project.godot`. Decide whether you want those runtime helpers in exported builds before you ship.
- **Stay on loopback.** All three bound to 127.0.0.1 by default. If a container or VM boundary forces a non-loopback bind, set Godot Editor MCP's `GODOT_MCP_AUTH_TOKEN` and keep the port off public networks.
- **Treat these tools as code execution.** Writing and attaching scripts and running the project all execute code as the user who runs the editor. On a CI runner, give that user nothing it doesn't need.
- **Re-run the probe on upgrades.** The 401, 403 and 421 checks above are a quick regression test. [Test your MCP server](guide:test-your-mcp-server) covers deeper checks.
