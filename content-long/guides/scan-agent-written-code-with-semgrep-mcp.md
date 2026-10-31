---
id: scan-agent-written-code-with-semgrep-mcp
type: guide
title: Scan agent-written code for vulnerabilities with the Semgrep MCP server
summary: "Give a coding agent a deterministic security scanner. Install the Semgrep CLI, run its built-in MCP server (`semgrep mcp`), wire it into Claude Code, Cursor, VS Code, Codex or Kiro, and call semgrep_scan and custom-rule scans. Includes two gotchas we hit, and when SonarQube's MCP server fits better."
description: "A hands-on guide to the Semgrep MCP server, which moved from the archived semgrep/mcp repo into the main Semgrep CLI as the `mcp` subcommand (packaged as Semgrep Guardian plugins for Claude Code and Cursor). We installed semgrep 1.182.1 from PyPI on 2026-10-28, connected to `semgrep mcp` over stdio with the MCP Python SDK, listed its seven tools and scanned a small Python file. It covers client configs, the tools, a custom-rule scan, two gotchas (semgrep_scan needs absolute paths and fails with metrics off; the custom-rule tool needs relative paths), and where SonarQube's MCP server is the better fit."
author: Agentica Author
difficulty: beginner
time_estimate: 20 min
prerequisites:
  - "Python 3 with pip, or Homebrew (to install the Semgrep CLI)"
  - "An MCP client: Claude Code, Cursor, VS Code with Copilot, Codex CLI, Kiro or your own"
  - "Optional: a Semgrep AppSec Platform account and token for the findings and supply-chain tools"
tags: [security, static-analysis, sast, mcp, coding-agents, claude-code, cursor, code-review]
entries: [semgrep-mcp, sonarqube-mcp-server, snyk-agent-scan, claude-code, cursor, vscode-agents, codex-cli, kiro, mcp-python-sdk, trailofbits-skills]
related: [add-mcp-servers-to-claude-code, test-your-mcp-server, test-an-agent-for-prompt-injection, run-untrusted-code-in-a-sandbox, coding-agent-harnesses, llm-red-teaming-tools]
sources:
  - title: "Semgrep Guardian / MCP server README (semgrep repo, cli/src/semgrep/mcp)"
    url: https://github.com/semgrep/semgrep/blob/develop/cli/src/semgrep/mcp/README.md
    accessed: 2026-10-28
  - title: "semgrep/mcp (archived standalone repo, deprecation notice)"
    url: https://github.com/semgrep/mcp
    accessed: 2026-10-28
  - title: "PyPI: semgrep"
    url: https://pypi.org/project/semgrep/
    accessed: 2026-10-28
  - title: "SonarQube MCP Server README"
    url: https://github.com/SonarSource/sonarqube-mcp-server
    accessed: 2026-10-28
  - title: "SonarQube MCP Server license (Sonar Source-Available License v1.0)"
    url: https://github.com/SonarSource/sonarqube-mcp-server/blob/master/LICENSE
    accessed: 2026-10-28
  - title: "Codex docs: Model Context Protocol (config.toml mcp_servers)"
    url: "https://learn.chatgpt.com/docs/extend/mcp?surface=cli"
    accessed: 2026-10-31
last_verified: 2026-10-28
published: 2026-10-28
updated: 2026-10-31
---

Coding agents write a lot of code quickly, and they repeat the same insecure patterns people do: `shell=True`, SQL built with string formatting, hard-coded secrets. A model reviewing its own output is not a reliable check. A static analyzer is deterministic: the same code gives the same findings every time. [Semgrep MCP](entry:semgrep-mcp) puts Semgrep's scanner behind MCP tools so the agent can scan what it just wrote and fix it before you see the diff.

## 1. Know where the server lives now

The standalone `semgrep/mcp` repository (and its `semgrep-mcp` PyPI package and `ghcr.io/semgrep/mcp` image) is archived. The server now ships inside the Semgrep CLI as a subcommand:

```bash
python3 -m pip install semgrep    # or: brew install semgrep
semgrep --version                 # we used 1.182.1
semgrep mcp --help
```

`semgrep mcp` speaks stdio by default (it looks like it hangs; that's expected) or Streamable HTTP with `-t streamable-http`, which listens on `127.0.0.1:8000/mcp` (`-p` changes the port). There is also a Docker route: `docker run -i --rm semgrep/semgrep semgrep mcp -t stdio`.

Semgrep also sells this as **Semgrep Guardian**: a plugin that bundles the MCP server with hooks and skills, scans every file an agent writes with Semgrep Code, Supply Chain and Secrets, and prompts the agent to regenerate code until the scan is clean or you dismiss the finding.

## 2. Connect your agent

**Claude Code, plugin route** (per the README): run `/plugin`, go to **Discover**, install **Semgrep**, then run `/setup-semgrep-plugin`, which also installs the CLI. **Cursor:** add Semgrep from the Cursor Plugin Marketplace, run `/setup-semgrep-plugin`, then restart.

**Any client, plain MCP route.** If you just want the tools, point the client at the subcommand:

```bash
# Claude Code
claude mcp add semgrep -- semgrep mcp
```

```json
// VS Code: .vscode/mcp.json   (Kiro: .kiro/settings/mcp.json uses "mcpServers")
{
  "servers": {
    "semgrep": { "command": "semgrep", "args": ["mcp"] }
  }
}
```

```toml
# Codex CLI: ~/.codex/config.toml
[mcp_servers.semgrep]
command = "semgrep"
args = ["mcp"]
```

To use the AppSec Platform tools, run `semgrep login` or set `SEMGREP_APP_TOKEN` in the server's environment. [Add MCP servers to Claude Code](guide:add-mcp-servers-to-claude-code) covers scopes and config files in more detail.

## 3. The tools

When we connected over stdio with the [MCP Python SDK](entry:mcp-python-sdk), the server (v1.182.1) listed seven tools:

| Tool | What it does | Needs a Semgrep account |
|---|---|---|
| `semgrep_scan` | Scans files by **absolute path** with Semgrep's default rules and returns JSON findings | No |
| `semgrep_scan_with_custom_rule` | Scans code content you pass in with a YAML rule you pass in | No |
| `semgrep_rule_schema` | Returns the rule schema, so the agent can write valid custom rules | No |
| `get_abstract_syntax_tree` | Returns a file's AST as JSON | No |
| `get_supported_languages` | Lists supported languages | No |
| `semgrep_scan_supply_chain` | Scans a workspace's dependencies for known-vulnerable packages | Yes (Supply Chain) |
| `semgrep_findings` | Fetches existing findings from the Semgrep AppSec Platform | Yes |

## 4. Try a scan

We scanned this file:

```python
import subprocess, sqlite3
def run(cmd):
    return subprocess.call(cmd, shell=True)
def find(db, name):
    return db.execute("SELECT * FROM users WHERE name = '%s'" % name).fetchall()
```

`semgrep_scan` with `{"code_files": [{"path": "/abs/path/app.py"}]}` returned three findings: `python.lang.security.audit.subprocess-shell-true` (line 3), `python.lang.security.audit.formatted-sql-query` (line 5) and `python.sqlalchemy.security.sqlalchemy-execute-raw-query` (line 5).

A custom rule works the same way. The agent can call `semgrep_rule_schema` first, then pass a rule like this together with the file content:

```yaml
rules:
- id: sql-string-format
  languages: [python]
  severity: ERROR
  message: SQL built with string formatting; use parameters
  pattern: $DB.execute("..." % $X)
```

With `{"code_files": [{"path": "app.py", "content": "..."}], "rule": "<the YAML>"}` it reported one finding on line 5. Custom rules are a good fit for project conventions ("never call our internal `unsafe_eval`") that no public ruleset knows about.

To make the agent actually use the tools, say so in your agent instructions (for example in `AGENTS.md` or `CLAUDE.md`): *after editing code, run `semgrep_scan` on every changed file and fix ERROR findings before finishing.* Guardian's hooks do this for you in Claude Code and Cursor.

## 5. Two gotchas we hit

- **Paths.** `semgrep_scan` takes absolute paths to files on disk and reads them itself. `semgrep_scan_with_custom_rule` is the opposite: it takes content and rejects absolute paths with `Untrusted path must be relative`. Pass a relative name such as `app.py`.
- **Metrics off breaks the default scan.** With `SEMGREP_SEND_METRICS=off`, `semgrep_scan` failed with *"Cannot run scan with auto config when metrics are off"*. The tool has no parameter for picking a ruleset, so either allow Semgrep's metrics for that server or use `semgrep_scan_with_custom_rule` with your own rules. Check Semgrep's docs on what metrics send before you decide.

Also note the server logs that it initializes tracing at startup. If outbound telemetry from developer machines is a concern, check that with Semgrep before you roll it out.

## 6. When SonarQube's MCP server fits better

[SonarQube MCP Server](entry:sonarqube-mcp-server) solves a different part of the problem. Semgrep MCP is a local scanner the agent runs on fresh code. SonarQube's server connects the agent to a SonarQube Cloud or Server project you already analyze: it can search issues and security hotspots, read quality-gate status, coverage, duplications and dependency risks, change issue status, and analyze a single file with `analyze_code_snippet`. It needs a SonarQube token (`SONARQUBE_TOKEN` plus `SONARQUBE_ORG` or `SONARQUBE_URL`) and runs from the `sonarsource/sonarqube-mcp` container. Its license is the Sonar Source-Available License v1.0, not an open-source one. Semgrep's CLI is LGPL-2.1.

Use Semgrep MCP when you want a fast check inside the agent loop with no server. Use SonarQube's when your team already gates merges on SonarQube and you want the agent to see and fix the same issues. They can run side by side.

## Scope

Static analysis finds known bug patterns in code. It doesn't tell you whether the agent itself can be manipulated. For that, see [Test a tool-using agent for prompt injection](guide:test-an-agent-for-prompt-injection). To check the MCP servers and skills installed on a machine, see [Snyk Agent Scan](entry:snyk-agent-scan). And run code an agent wrote but you haven't reviewed in a sandbox ([Run untrusted code in a sandbox](guide:run-untrusted-code-in-a-sandbox)).
