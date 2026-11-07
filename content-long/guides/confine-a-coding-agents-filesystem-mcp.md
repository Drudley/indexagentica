---
id: confine-a-coding-agents-filesystem-mcp
type: guide
title: Confine a coding agent's filesystem MCP access
summary: "Separate the workspace a coding agent sees from the files its MCP server can touch. A practical review of allowed directories, legacy Roots, read-only tools, symlinks and hard links, with a disposable acceptance checklist."
description: "A consumer-side guide to filesystem MCP access for coding agents, based on the reference filesystem server README at commit 36380287ed3b15d115b55f546617d723072b1296. Explains directory allowlists versus OS permissions, read-only server mode versus read-only mounts, legacy Roots replacement and --confine-roots, symlink escape checks, hard-link write effects, and the limits of tool-name approval. No real repository or credentials are used; live client/server enforcement was not tested."
author: Agentica Author
difficulty: intermediate
time_estimate: 25 min
prerequisites:
  - "Control over how your coding agent launches its filesystem MCP server"
  - "A disposable directory outside real repositories, containing only synthetic files"
  - "For the reference server described here, Node.js 24+ according to its current README; verify the requirements of the exact release you deploy"
tags: [mcp, coding-agents, filesystem, permissions, least-privilege, security]
entries: [model-context-protocol, codex-cli, cursor, claude-code]
related: [connect-an-agent-to-a-remote-mcp-server, test-your-mcp-server, screen-tool-output-for-prompt-injection, run-untrusted-code-in-a-sandbox]
sources:
  - title: "Reference filesystem server README, pinned source snapshot"
    url: https://github.com/modelcontextprotocol/servers/blob/36380287ed3b15d115b55f546617d723072b1296/src/filesystem/README.md
    accessed: 2026-11-07
  - title: "MCP deprecated features, revision 2026-07-28"
    url: https://modelcontextprotocol.io/specification/2026-07-28/deprecated
    accessed: 2026-11-07
  - title: "MCP Roots, revision 2025-11-25"
    url: https://modelcontextprotocol.io/specification/2025-11-25/client/roots
    accessed: 2026-11-07
  - title: Docker Engine bind mounts
    url: https://docs.docker.com/engine/storage/bind-mounts/
    accessed: 2026-11-07
last_verified: 2026-11-07
published: 2026-11-07
updated: 2026-11-07
---

## Start with the boundary, not the client brand

A coding agent needs to read a project. That does not mean its filesystem MCP server needs your home directory, sibling projects or credential folders. Nor does approving a tool called `read_text_file` tell you which file it may read.

This guide is about **the server's filesystem authority**, not connecting another endpoint or detecting malicious prose. It applies when adding a filesystem integration to a coding client such as [Codex](entry:codex-cli), [Cursor](entry:cursor) or [Claude Code](entry:claude-code); it does not claim those clients all expose the same controls. For connection setup, use [Connect an agent to a remote MCP server](guide:connect-an-agent-to-a-remote-mcp-server).

The concrete example is the MCP reference filesystem server. All implementation details below come from its [pinned README](https://github.com/modelcontextprotocol/servers/blob/36380287ed3b15d115b55f546617d723072b1296/src/filesystem/README.md), checked on 2026-11-07. This is a **source snapshot, not a tested npm release**. Before copying a flag into production, check that your installed release supports it.

## Make three decisions separately

**Which paths?** Give the server the smallest explicit allowed-directory set that supports the job. For code review, prefer a disposable copy of one project, with secrets removed. Do not choose the parent directory merely because it is convenient to switch projects.

**Which operations?** Reading and writing are separate grants. The reference server documents `--read-only`, which registers only tools annotated `readOnlyHint: true`; write tools are absent and calls to them fail as unknown tools. This is that implementation's enforcement rule, not a universal promise made by an MCP annotation. A different server must be assessed separately.

**Which process can bypass the integration?** A filesystem MCP boundary constrains that server. It does not constrain an agent's independent terminal tool or another server. If the agent can run arbitrary commands as your normal account, do not describe the whole session as read-only just because this one server is read-only. For process isolation, see [Run untrusted code in a sandbox](guide:run-untrusted-code-in-a-sandbox).

These decisions should produce a small written policy: “This server may read the synthetic project directory, may not write anything, and has no reason to see the rest of the host.” Review that policy before reviewing the JSON client configuration.

## Do not mistake legacy Roots for a permanent allowlist

In the 2025-11-25 [Roots specification](https://modelcontextprotocol.io/specification/2025-11-25/client/roots), clients advertise roots support and servers request `roots/list`. Root URIs must use `file://`. The spec tells servers they **should** validate paths and respect root boundaries; that is not evidence that any particular executable does so.

There is a more surprising implementation detail: the reference server says a legacy client's Roots can **replace all command-line allowed directories**, not merely add a helpful workspace label. A narrow launch argument is therefore not the whole policy when Roots replacement is enabled.

Its documented `--confine-roots` option instead intersects client Roots with the command-line directories. A broad root such as `/` is narrowed to those directories; an unrelated root is ignored. Without command-line directories the flag has no effect. Do not rely on the option alone while omitting the directories it is meant to confine.

The [2026-07-28 deprecation registry](https://modelcontextprotocol.io/specification/2026-07-28/deprecated) marks Roots deprecated and recommends tool parameters, resource URIs or server configuration instead. Deprecated does not mean universally removed: the registry says no features have yet been removed under that policy. The reference server's own newer-protocol connection does not request Roots and uses its command-line directories. Record both your client's protocol behavior and the installed server version when investigating a mismatch.

## Read-only has two useful layers

For review-only work, I recommend both a read-only server configuration and, where available, an operating-system-enforced read-only view of the project.

The first keeps write tools out of the agent's interface. The second provides an independent filesystem restriction. Docker's [bind-mount documentation](https://docs.docker.com/engine/storage/bind-mounts/) says bind mounts are writable by default; `readonly` or `ro` makes a bind mount read-only. Inspect the actual mount rather than assuming a configuration label took effect: Docker's example shows `RW: false` for a read-only bind mount.

Do not generalize that to every nested mount. Docker documents recursive read-only caveats, including the Linux kernel 5.12 requirement. If the project contains submounts, inspect those too or use a simpler synthetic directory. This is not a complete container-hardening recipe.

If some paths must remain writable, use separate server instances with distinct directories. The reference README warns that a writable legacy instance can regain protected paths through Roots replacement unless confined. A second server name alone does not separate filesystem authority.

## Test names and resolved targets

Two path details deserve explicit review.

**Symlinks.** The reference README says requested paths are resolved and checked against resolved allowed directories. A link inside the project that targets a sibling outside it should therefore be refused. Test that with fake data, not a link to a real secret. A successful ordinary read does not exercise this boundary.

**Hard links.** The same README says writes modify an existing file in place. If an allowed file has another hard-linked name outside the allowed directories, changing it changes the shared content at both names. Allowed-directory checks are path-based; they do not inspect every name for the inode. Its `get_file_info` reports `hardLinks`, and a count above one deserves attention before writing. Prefer a fresh synthetic copy for trials; do not test destructive behavior on package-store links or your working checkout.

Read-only access also does not mean harmless access: material returned by a read tool can still contain hostile instructions. Keep that separate from the path review; [Screen tool output for prompt injection](guide:screen-tool-output-for-prompt-injection) addresses the content layer.

## A disposable acceptance checklist

Run these checks only in a scratch area containing fake files. These are **proposed acceptance checks**, not results from a live server run here.

| Check | What to record |
|---|---|
| Enumerate tools | In the reference server's read-only mode, write tools should be absent. Do not test by editing a real file. |
| Call `list_allowed_directories` | Compare its effective list with your intended directory set, including any legacy Roots replacement. |
| Read an allowed synthetic file | Confirm the ordinary path succeeds. |
| Read a fake sibling file outside the allowlist | Confirm refusal, not merely a missing-file response. Create the sibling fixture beforehand. |
| Read through a symlink to that sibling | Confirm resolved-target refusal. |
| Connect or change legacy Roots | Confirm they cannot widen a confined server. Include an unrelated root and a broad parent root. |
| Inspect a read-only container mount | Confirm the intended source/destination and `RW: false`; account for submounts. |
| Review every other agent tool | Look for a terminal or second server that can reach the same protected path. |

Keep the client version, server version or source commit, launch arguments, effective directory list and observed results together. Recheck after upgrades or workspace changes. A prior approval is not evidence that today's process has the same filesystem view.

## Verification limits

The facts above were checked against the pinned reference README, the two specified MCP revisions and Docker's bind-mount documentation. No provider credentials, real repositories or live agent sessions were used. There is no executable configuration or server implementation in this guide, and no claim that its proposed acceptance checks have passed on Codex, Cursor, Claude Code, Docker or a released filesystem-server package. Run them on your exact stack before granting access.
