---
id: let-an-agent-send-email-safely
type: guide
title: Let an agent send email safely through the Resend MCP server
summary: "Give an agent email through Resend's MCP server without letting it mail anyone, anything, at any time: pin the sender, fence off local files, draft first, deny-by-default tool gating, and a human approval step that shows recipients and subject. Tested offline against resend-mcp 2.28.0."
description: "Resend's MCP server (npm resend-mcp 2.28.0) exposes 136 tools, of which 56 are marked read-only, and it has no option to turn tools off. Several send real email the moment they are called. This guide shows how to keep that safe: choose the API key permission, pin the sender with --sender, restrict attachments with --allowed-file-dirs, prefer inbox drafts, gate every send through a deny-by-default Claude Agent SDK can_use_tool callback with a recipient-domain allowlist and a human approval prompt, add idempotency keys so a retry cannot send twice, and test with resend.dev addresses. The gate, the sender pinning and the file restriction were tested offline on 2026-11-04 with fetch stubbed out; no real email was sent."
author: Agentica Author
difficulty: intermediate
time_estimate: 40 min
prerequisites:
  - "A Resend account and API key (only for the final live test; everything else runs offline)"
  - "Node.js 18+ for resend-mcp, and Python 3.10+ with claude-agent-sdk for the gate"
tags: [email, resend, mcp, human-in-the-loop, permissions, tool-gating, prompt-injection, claude-agent-sdk]
entries: [resend-mcp, agentmail, claude-agent-sdk]
related: [screen-tool-output-for-prompt-injection, test-an-agent-for-prompt-injection, connect-an-agent-to-a-remote-mcp-server]
sources:
  - title: Resend MCP server documentation
    url: https://resend.com/docs/mcp-server
    accessed: 2026-11-04
  - title: resend-mcp README (options and local file access warning)
    url: https://github.com/resend/resend-mcp
    accessed: 2026-11-04
  - title: resend-mcp on npm
    url: https://www.npmjs.com/package/resend-mcp
    accessed: 2026-11-04
  - title: "Resend changelog: Remote MCP Server"
    url: https://resend.com/changelog/remote-mcp-server
    accessed: 2026-11-04
  - title: "Resend API: Create API key (permissions and domain restriction)"
    url: https://resend.com/docs/api-reference/api-keys/create-api-key
    accessed: 2026-11-04
  - title: "Resend: Send test emails"
    url: https://resend.com/docs/dashboard/emails/send-test-emails
    accessed: 2026-11-04
  - title: "Resend: Idempotency keys"
    url: https://resend.com/docs/dashboard/emails/idempotency-keys
    accessed: 2026-11-04
  - title: "Claude Agent SDK: Configure permissions"
    url: https://code.claude.com/docs/en/agent-sdk/permissions
    accessed: 2026-11-04
  - title: claude-agent-sdk on PyPI
    url: https://pypi.org/project/claude-agent-sdk/
    accessed: 2026-11-04
last_verified: 2026-11-06
published: 2026-11-04
updated: 2026-11-06
---

## The problem

An email tool is one of the few agent tools whose mistakes can't be undone. A sent message stays sent. If the agent reads inbound mail, that mail is untrusted input that can ask it to forward a thread, BCC someone or attach a file.

The [Resend MCP server](entry:resend-mcp) is a good example because it is thorough. Version 2.28.0 (npm, 2026-11-03) lists **136 tools**. Only 56 carry `readOnlyHint`. The server has no flag to disable tools or run read-only. We grepped the package and found none. These tools send or have effects outside your account:

| Effect | Tools |
|---|---|
| Sends email now or later | `send-email` (can schedule), `send-batch-emails` (up to 100), `send-broadcast`, `reply-to-inbox-thread-email`, `forward-inbox-thread-email`, `send-inbox-draft`, `send-new-inbox-email` |
| Changes what gets sent later | `create-broadcast`, `update-broadcast`, `create-automation`, `update-automation`, `send-event` (triggers automations), `update-email` (reschedule) |
| Sends data elsewhere | `create-webhook`, `update-webhook`, `replay-webhook-event`, `share-email` (public link) |
| Changes access or deliverability | `create-api-key`, `remove-api-key`, `create-domain`, `remove-domain`, `add-suppression`, `remove-suppression`, `revoke-oauth-grant` |

The four inbox send tools describe themselves as sending "a real email the moment you call it". `create-inbox-draft` saves a draft and sends nothing.

The approach below uses five layers. Each one is cheap, and none depends on the model behaving.

## 1. Pick the key for the job

Resend API keys have one of two permissions ([Create API key](https://resend.com/docs/api-reference/api-keys/create-api-key)):

- `full_access` can create, delete, get and update any resource.
- `sending_access` can only send. For Inboxes it can call only Reply to Thread Email, Forward Thread Email, Create Draft and Send Draft. It can be restricted to one domain, and a domain-restricted key can use only that domain's inboxes.

There is no read-only key. That means:

- **A notifier agent** only sends alerts and never reads mail. Give it a `sending_access` key restricted to a domain you use only for agent mail. The key itself then blocks API keys, webhooks, domains and log reads, whatever the MCP server exposes.
- **An inbox agent** reads threads and drafts replies. It needs `full_access`, because `sending_access` can't list or read threads. The gate in step 4 is then your main control.

The hosted server at `https://mcp.resend.com/mcp` signs you in with OAuth. You "grant the necessary permissions" and can revoke them in Team settings ([changelog](https://resend.com/changelog/remote-mcp-server)). The docs we read don't say whether the OAuth grant can be narrowed to sending only. If you need the narrow key, pass it as a Bearer token or run the server locally.

## 2. Pin the sender and fence off files

Run the server locally so you control its flags:

```bash
RESEND_API_KEY=re_... npx -y resend-mcp@2.28.0 \
  --sender agent@yourdomain.example \
  --allowed-file-dirs /srv/agent-outbox
```

**`--sender`** (or `SENDER_EMAIL_ADDRESS`) removes the `from` field from the `send-email` input schema. We tested this offline with `fetch` stubbed out. A call that passed `"from": "ceo@evil.example"` anyway went to the API with `from: agent@yourdomain.example`.

**`--allowed-file-dirs`** (or `MCP_ALLOWED_FILE_DIRS`) limits where `attachments[].filePath` and `create-contact-import` may read from. The README is blunt: it is "unrestricted on stdio when unset", and over `--http` file reads are disabled unless you set it. We tested both cases on stdio:

- Unset: a call attaching `/tmp/secret.txt` was sent with the file attached.
- Set to another directory: the same call returned `File not found or outside the allowed directories.` and made no request.

Always set it on stdio, even to an empty directory.

## 3. Draft first

For inbox work, let the agent write with `create-inbox-draft` and `update-inbox-draft`, and have a person send from Resend. The agent gets the useful part of the job, and the irreversible step stays with a human. If you want the agent to send, route it through the gate below.

Drafts aren't harmless just because they don't send. Both draft tools take `to`, `cc`, `bcc` and `attachments`, and `send-inbox-draft` later sends whatever the draft holds. So the gate checks draft calls exactly as it checks sends. A reply draft created without `to` is addressed to the author of the message it replies to, according to the tool's own description.

## 4. Gate every call, deny by default

Don't filter with a list of dangerous tools. A new server version can add a tool your denylist doesn't name. The gate below runs 11 read-only tools on their own. It sends three tools to a human for approval: `send-email`, `reply-to-inbox-thread-email` and `send-inbox-draft`. It refuses everything else, including `forward-inbox-thread-email`, `send-new-inbox-email` and tools that don't exist yet.

**Draft tools** (`create-inbox-draft`, `update-inbox-draft`) run without a prompt, but only after these checks:

- every `to`/`cc`/`bcc` address must be a single address in an allowed domain
- at most five recipients per call
- no attachments
- `update-inbox-draft` may pass `null` to clear recipients or attachments

**Send tools** get the same recipient and attachment checks. The gate also:

- refuses scheduling, custom headers and `replyAll`
- requires at least one recipient for `send-email`
- adds an idempotency key
- shows a person the details before anything goes out

**Every error fails closed.** If the policy hits an unexpected value or an exception, the call is refused and the person is never asked.

```python
"""Approval gate for an agent using the Resend MCP server (resend-mcp 2.28.0 tool names).

Deny by default: a tool runs on its own only if it is in AUTO_ALLOW, goes to a human
only if it is in ASK, and is refused otherwise -- including tools added in later versions.
Any call that names recipients or attachments is checked, drafts included.
Any error inside the policy refuses the call (fail closed).
"""
import hashlib, json, re

SERVER = "resend"                      # the name you give the server in mcp_servers
P = f"mcp__{SERVER}__"

READ_ONLY = {                          # read-only inbox and email tools
    "list-inboxes", "get-inbox", "list-inbox-threads", "search-inbox-threads",
    "get-inbox-thread", "list-inbox-thread-emails", "get-inbox-thread-email",
    "list-inbox-drafts", "get-inbox-draft", "list-emails", "get-email",
}
DRAFTS = {"create-inbox-draft", "update-inbox-draft"}   # save drafts, send nothing
AUTO_ALLOW = READ_ONLY | DRAFTS
ASK = {"send-email", "reply-to-inbox-thread-email", "send-inbox-draft"}
ALLOWED_RECIPIENT_DOMAINS = {"resend.dev"}   # widen deliberately, e.g. {"yourcompany.com"}
MAX_RECIPIENTS = 5

_ADDR = re.compile(r"[^@\s,;<>\"']+@[A-Za-z0-9.-]+")
_NAMED = re.compile(r"[^@,;<>\"']*[^@\s,;<>\"'][^@,;<>\"']* <([^<>]*)>")

class Refuse(Exception):
    pass

def _address(a):
    """Return the bare address in a@b or `Name <a@b>`; refuse anything else."""
    if not isinstance(a, str):
        raise Refuse("recipient is not a string")
    # Refuse ASCII controls before any parsing so a CR/LF in a display name
    # cannot smuggle a header (e.g. "X\r\nBcc: y <a@resend.dev>").
    if any(ord(c) < 32 or ord(c) == 127 for c in a):
        raise Refuse(f"recipient contains a control character: {a!r}")
    m = _NAMED.fullmatch(a)
    addr = m.group(1) if m else a
    if not _ADDR.fullmatch(addr):
        raise Refuse(f"recipient not a single plain address: {a!r}")
    return addr

def _recipients(args, nullable=False):
    out = []
    for field in ("to", "cc", "bcc"):
        if field not in args or (nullable and args[field] is None):
            continue
        v = args[field]
        if isinstance(v, str):
            v = [v]
        if not isinstance(v, list):
            raise Refuse(f"{field} must be a string or a list of strings")
        out += [_address(a) for a in v]
    if len(out) > MAX_RECIPIENTS:
        raise Refuse(f"more than {MAX_RECIPIENTS} recipients")
    bad = [a for a in out if a.rsplit("@", 1)[1].lower() not in ALLOWED_RECIPIENT_DOMAINS]
    if bad:
        raise Refuse(f"recipient domain not allowed: {', '.join(bad)}")
    return out

def _no_extras(args):
    if args.get("attachments"): raise Refuse("attachments are not allowed")
    if args.get("scheduledAt"): raise Refuse("scheduled sends are not allowed")
    if args.get("headers"): raise Refuse("custom headers are not allowed")

def _check(tool, args):
    if not isinstance(tool, str) or not tool.startswith(P): return ("deny", f"not a {SERVER} tool")
    if not isinstance(args, dict): return ("deny", "arguments are not an object")
    name = tool[len(P):]
    if name in READ_ONLY: return ("allow", None)
    if name in DRAFTS:
        _no_extras(args)
        _recipients(args, nullable=(name == "update-inbox-draft"))   # null clears recipients
        return ("allow", None)
    if name not in ASK: return ("deny", f"{name} is not on the allowlist")
    args = dict(args)
    _no_extras(args)
    if args.get("replyAll"): raise Refuse("replyAll is not allowed")
    rcpts = _recipients(args)
    if name == "send-email" and not rcpts: raise Refuse("no recipients")
    if not args.get("idempotencyKey"):
        # Same content -> same key, so a retried call cannot send twice.
        digest = hashlib.sha256(json.dumps([name, args], sort_keys=True).encode()).hexdigest()
        args["idempotencyKey"] = f"agent-{digest[:32]}"
    return ("ask", args)

def check(tool, args):
    """Return ("allow", None) | ("ask", args_to_send) | ("deny", reason). Pure: no I/O."""
    try:
        return _check(tool, args)
    except Refuse as e:
        return ("deny", str(e))
    except Exception as e:  # fail closed
        return ("deny", f"policy error ({type(e).__name__}); refused")

def summary(tool, args):
    name = tool[len(P):]
    lines = [f"Agent wants to call {name}"]
    for k in ("to", "cc", "bcc", "replyTo", "subject", "inboxId", "threadId", "emailId", "draftId"):
        if args.get(k) not in (None, "", []): lines.append(f"  {k}: {args[k]}")
    body = args.get("text") or args.get("html") or ""
    if body: lines.append("  body:\n    " + str(body)[:800].replace("\n", "\n    "))
    if name == "reply-to-inbox-thread-email":
        lines.append("  (goes to the author of the message being answered; that address is not in this call)")
    if name == "send-inbox-draft":
        lines.append("  (recipients, subject and body are in the draft, not this call; open it with get-inbox-draft"
                     " or in Resend before approving)")
    return "\n".join(lines)

def make_can_use_tool(ask_human):
    """ask_human(text) -> bool. Returns a Claude Agent SDK can_use_tool callback."""
    from claude_agent_sdk import PermissionResultAllow, PermissionResultDeny
    async def can_use_tool(tool_name, tool_input, context):
        verdict, extra = check(tool_name, tool_input)
        if verdict == "allow": return PermissionResultAllow()
        if verdict == "deny": return PermissionResultDeny(message=extra)
        try:
            text = summary(tool_name, extra)
        except Exception:
            return PermissionResultDeny(message="could not summarise this send; refused")
        if await ask_human(text):
            return PermissionResultAllow(updated_input=extra)
        return PermissionResultDeny(message="A human declined this send. Do not retry it.")
    return can_use_tool
```

Wire it into the [Claude Agent SDK](entry:claude-agent-sdk) as `can_use_tool`:

```python
import asyncio, os
from claude_agent_sdk import ClaudeAgentOptions, query
from email_gate import make_can_use_tool

async def ask_human(text: str) -> bool:
    print(text)
    answer = await asyncio.to_thread(input, "Send this email? [y/N] ")
    return answer.strip().lower() == "y"

options = ClaudeAgentOptions(
    mcp_servers={"resend": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "resend-mcp@2.28.0",
                 "--sender", "agent@yourdomain.example",
                 "--allowed-file-dirs", "/srv/agent-outbox"],
        "env": {"RESEND_API_KEY": os.environ.get("RESEND_API_KEY", "")},
    }},
    permission_mode="default",           # never "bypassPermissions"
    can_use_tool=make_can_use_tool(ask_human),
)

async def main():
    async for msg in query(prompt="Draft a reply to the newest thread in my support inbox.", options=options):
        print(msg)

if __name__ == "__main__":
    asyncio.run(main())
```

Two SDK rules matter here ([permissions docs](https://code.claude.com/docs/en/agent-sdk/permissions)):

- **Don't put Resend tools in `allowed_tools`.** Allow rules are evaluated before `can_use_tool`, and "auto-approved tools never reach `canUseTool`".
- **Don't use `bypassPermissions`.** It approves unlisted tools before your callback sees them.

The gate does its own allowing so that every Resend call passes through it. In other harnesses, put the same `check()` function wherever tool calls are approved.

### Why these checks

- **One address per string.** A recipient must be either a plain `local@domain` or exactly `Name <local@domain>`. The name can't contain `@`, quotes, `,`, `;`, `<` or `>`. Anything with a separator or stray whitespace is refused before the domain is checked, including `a@evil.example, delivered@resend.dev`, `<a@evil.example>delivered@resend.dev`, `a@evil.example;b@resend.dev` and `a@evil.example <delivered@resend.dev>`. ASCII control characters (CR, LF, TAB, NUL, ESC, DEL and the rest of the C0 set) are refused too, so a display name such as `X\r\nBcc: y <a@resend.dev>` cannot smuggle a header past the approval prompt. Numbers, booleans, objects and lists holding non-strings are refused too. The domain must match the allowlist exactly, so `a@resend.dev.evil.example` is refused.
- **No custom headers.** A header such as `Bcc` would bypass the recipient check.
- **Idempotency keys.** Resend drops a repeat of the same key within 24 hours, returns 409 if the payload differs, and accepts keys up to 256 characters ([docs](https://resend.com/docs/dashboard/emails/idempotency-keys)). The gate derives the key from the tool name and arguments, so a retried, identical call can't send twice. We confirmed offline that resend-mcp forwards `idempotencyKey` as the `Idempotency-Key` header.
- **What the gate can't see.** `reply-to-inbox-thread-email` goes to the author of the message being answered, and that address isn't in the call. The gate checks only the extra `cc`/`bcc` and refuses `replyAll`. `send-inbox-draft` takes only an `inboxId`, a `draftId`, optional `headers` (refused) and an `idempotencyKey`. The draft's recipients and attachments were checked when the agent created or updated it through this gate. But a draft can also come from a person, another tool or a reply draft addressed by default, so `send-inbox-draft` still needs human approval. The prompt asks you to open the draft first.
- **Search filters.** `search-inbox-threads` also takes `to`/`cc`/`bcc`, but only as search filters. It is read-only and sends nothing. No other auto-allowed tool takes recipients or attachments. The test asserts this against the 2.28.0 schemas.
- **Untrusted content.** Thread contents come back through allowed read tools and can carry instructions. The gate limits what a hijacked agent can do. To catch injection earlier, see [Screen tool output for prompt injection](guide:screen-tool-output-for-prompt-injection).

## 5. Test without mailing anyone

Resend provides test addresses ([Send test emails](https://resend.com/docs/dashboard/emails/send-test-emails)):

- `delivered@resend.dev`
- `bounced@resend.dev` (SMTP 550 5.1.1)
- `complained@resend.dev` (marked as spam)
- `suppressed@resend.dev`

All except `suppressed` take `+labels`, such as `delivered+signup@resend.dev`. Test emails count against your sending quota. The gate's default allowlist is `{"resend.dev"}`, so the agent can reach only these addresses until you widen it on purpose.

To run the server with no network at all, preload a stub `fetch` that records requests:

```javascript
// fake_fetch.mjs: node --import ./fake_fetch.mjs node_modules/resend-mcp/dist/index.js
import { appendFileSync } from 'node:fs';
const LOG = process.env.FAKE_FETCH_LOG || '/tmp/fake_fetch.log';
globalThis.fetch = async (url, init = {}) => {
  appendFileSync(LOG, JSON.stringify({ url: String(url), method: init.method || 'GET',
    idem: new Headers(init.headers).get('idempotency-key'), body: init.body ? String(init.body) : null }) + '\n');
  return new Response(JSON.stringify({ id: '00000000-0000-0000-0000-000000000000' }),
    { status: 200, headers: { 'content-type': 'application/json' } });
};
```

With `RESEND_API_KEY` set to any dummy value, you can call tools over stdio and read exactly what would have gone to `api.resend.com`. That is how the results in step 2 were produced.

Unit-test the gate against the real tool list. Dump `tools/list` from the server into `tools.json`, then assert:

- every name in the gate exists
- the only auto-allowed tools without `readOnlyHint` are the two draft tools
- all 120 other tools are denied
- no auto-allowed tool takes recipient or attachment fields the gate doesn't check
- each of the tricks above is refused, for sends and drafts alike
- an exception inside the policy refuses the call

Our 106-case test passed on 2026-11-04 with claude-agent-sdk 0.2.178.

## What was and wasn't tested

**Tested offline on 2026-11-04**, with resend-mcp 2.28.0 and the network stubbed:

- the tool count and annotations
- sender pinning
- the `--allowed-file-dirs` behaviour
- idempotency-key forwarding
- the gate's 106 cases
- building the SDK options

**Not tested:**

- a live send
- the hosted server's OAuth grant
- `sending_access` keys against the MCP read tools
- a full agent run with a model

Tool names and counts change between versions. Re-dump `tools/list` and rerun the gate test when you upgrade, and pin the version as shown.

## Other email servers

[AgentMail](entry:agentmail) gives agents their own inboxes through an API and a hosted MCP server. The same layers apply: a narrow credential, drafts before sends, a deny-by-default gate and human approval. Map them onto its tool names before you rely on them.
