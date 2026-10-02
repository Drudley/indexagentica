---
id: run-untrusted-code-in-a-sandbox
type: guide
title: Run agent-generated code safely in a sandbox
summary: "A defense-in-depth recipe for executing LLM-written or user-supplied code: pick an isolation boundary, lock down egress, keep secrets out, cap time and resources, and treat the output as untrusted."
description: "Agent-generated code is untrusted code. This guide explains what a sandbox does and does not protect you from, then walks through the controls that matter in practice (VM-level isolation, outbound network policy, secret handling, timeouts, persistence and output handling) with working E2B and Modal examples, the equivalent settings on Daytona, Vercel Sandbox and Cloudflare, and a self-hosted option with microsandbox."
author: Agentica Author
difficulty: intermediate
time_estimate: 30 min
prerequisites:
  - Python 3.10+ (examples) or Node.js
  - An account and API key for one hosted sandbox provider (E2B and Modal are used in the examples; both have free credits)
tags: [sandboxes, code-execution, security, isolation, agents]
entries: [e2b, modal, daytona, vercel-sandbox, cloudflare-sandbox, fly-io, microsandbox, northflank-sandboxes]
sources:
  - title: E2B docs, Sandbox lifecycle
    url: https://docs.e2b.dev/sandbox
    accessed: 2026-10-02
  - title: E2B docs, Internet access
    url: https://docs.e2b.dev/network/internet-access
    accessed: 2026-10-02
  - title: E2B docs, Quickstart
    url: https://docs.e2b.dev/quickstart
    accessed: 2026-10-02
  - title: E2B docs, Running commands in sandbox
    url: https://docs.e2b.dev/commands
    accessed: 2026-10-02
  - title: E2B pricing
    url: https://e2b.dev/pricing
    accessed: 2026-10-02
  - title: Modal docs, Sandboxes
    url: https://modal.com/docs/guide/sandboxes
    accessed: 2026-10-02
  - title: Modal docs, Sandbox networking and security
    url: https://modal.com/docs/guide/sandbox-networking
    accessed: 2026-10-02
  - title: Modal docs, Security and privacy
    url: https://modal.com/docs/guide/security
    accessed: 2026-10-02
  - title: Daytona docs, Network Limits (Firewall)
    url: https://www.daytona.io/docs/en/network-limits
    accessed: 2026-10-02
  - title: Vercel docs, Sandbox firewall
    url: https://vercel.com/docs/sandbox/concepts/firewall
    accessed: 2026-10-02
  - title: Cloudflare docs, Sandboxes overview
    url: https://developers.cloudflare.com/sandbox/
    accessed: 2026-10-02
  - title: microsandbox README
    url: https://github.com/superradcompany/microsandbox
    accessed: 2026-10-02
  - title: Northflank Sandboxes
    url: https://northflank.com/product/sandboxes
    accessed: 2026-10-02
related: [code-sandboxes, coding-agent-starter, research-agent]
last_verified: 2026-10-02
published: 2026-10-02
---

## Why agent code needs a sandbox

Code that a model writes is untrusted. It is untrusted because the model can be wrong, and because the model may be steered: a prompt injection hidden in a web page, an issue comment or a tool result can make an agent write code that reads `~/.aws/credentials` and posts it somewhere. If that code runs on your laptop or in your API server's process, it has the same access as your laptop or your API server.

A sandbox gives the code its own disposable machine. The goal is simple to state: the worst thing the code can do is waste the sandbox's own CPU time and wreck its own filesystem. Getting there takes more than an isolation boundary, though. Most real incidents with agent code are about **what the sandbox can reach** (the network, mounted secrets, a writable volume shared with production), not about breaking out of the VM.

This guide uses five layers. Each one is cheap on its own, and each one covers a gap the others leave.

1. Isolation boundary: where the code runs.
2. Egress: what the code can talk to.
3. Secrets: what the code can read.
4. Limits: how long and how big it can run.
5. Output: what you do with what comes back.

## Layer 1: pick a real isolation boundary

Running generated code in `exec()`, a subprocess, or a plain Docker container on a shared host gives you namespaces and cgroups on a kernel you share with everything else on that host. That is a weak boundary for hostile code. The hosted sandbox products all put a stronger boundary in front:

- **MicroVMs with their own kernel.** [E2B](entry:e2b) and [Vercel Sandbox](entry:vercel-sandbox) use Firecracker microVMs. [Fly.io](entry:fly-io)'s Sprites are Firecracker VMs too. Cloudflare's Containers, the Linux side of [Cloudflare Sandboxes](entry:cloudflare-sandbox), are VMs with their own kernel that a Worker starts through a Durable Object. [microsandbox](entry:microsandbox) runs microVMs locally (KVM on Linux, Apple Silicon on macOS).
- **A user-space kernel.** [Modal](entry:modal) runs sandboxes on gVisor by default and now also offers a `runtime="vm"` option that gives a sandbox its own Linux kernel, for workloads such as Docker-in-sandbox or FUSE mounts.
- **Containers, optionally VMs.** [Daytona](entry:daytona) sandboxes are OCI containers by default, with VM sandboxes (Linux, Windows, nested KVM), macOS and GPU sandboxes as separate options.
- **Isolates for short, pure functions.** Cloudflare Dynamic Workers run untrusted JavaScript, Python or Wasm in a V8 isolate with no filesystem and, if you pass `globalOutbound: null`, no network. That fits small "evaluate this expression" or "transform this JSON" tasks, not `pip install`.

For a side-by-side view of these options with prices and limits, see the [code sandboxes comparison](comparison:code-sandboxes).

Whatever you pick, the rule is **one sandbox per task or per user session, never shared across users.** Sandboxes are cheap to create. Sharing one between two customers turns any bug in your agent into a cross-tenant data leak.

## Layer 2: deny egress by default

Outbound network access is how stolen data leaves. Most providers default to **allow-all** so that `pip install` works. Change that default for anything that touches private data:

| Provider | Default | Lock-down setting |
|---|---|---|
| E2B | internet on | `allow_internet_access=False`, or `network={"deny_out": [...], "allow_out": [...]}` with IPs, CIDRs or domains |
| Modal | internet on | `block_network=True`, `outbound_cidr_allowlist`, or `outbound_domain_allowlist` (beta) |
| Daytona | depends on org tier (Tier 1-2 restricted; Tier 3-4 full) | `network_block_all`, `network_allow_list` (CIDRs) or `domain_allow_list` |
| Vercel Sandbox | `allow-all` | `deny-all`, or a user-defined policy (allowed domains, allowed and denied CIDRs) that can change at runtime |
| Cloudflare Dynamic Workers | you decide per Worker | `globalOutbound: null` blocks all outbound requests |

Three details are easy to get wrong:

- **Domain allowlists match the TLS SNI, not the request.** Both Modal and Vercel document that a domain allowlist decides which hostname a connection negotiates, not which virtual host finally serves it. Two tenants of the same CDN can be reachable through one allowlisted name (domain fronting). If that matters, route traffic through a proxy you control: E2B supports a SOCKS5 proxy (BYOP), Daytona an `outboundProxyUrl`, Vercel a `forwardURL` rule, and Modal a sidecar.
- **Install first, then lock down.** A common pattern is to open the network, install dependencies, then narrow it before untrusted code runs. Vercel's policies can be updated at runtime without restarting the process. Modal has an alpha API for the same thing, which only works if you created the sandbox with an allowlist (for example `["*"]`) in the first place. A cleaner alternative is to bake dependencies into a custom image or template so the sandbox never needs the internet at all.
- **E2B domain rules need a deny-all.** When you allow hostnames in `allow_out`, E2B requires you to deny all other traffic in `deny_out`.

## Layer 3: keep secrets out of the sandbox

Anything in the sandbox's environment, filesystem or memory is readable by the code you run there. So:

- Don't pass your model provider key, cloud credentials or database URL into a sandbox that runs generated code. If the code must call an API, prefer a short-lived token scoped to that one API.
- Better, let the network layer add the credential. Vercel's firewall can broker credentials on an allowed domain with a `transform` rule, and E2B can inject a stored secret into matching outbound requests through its egress proxy. The code makes an unauthenticated request; the proxy adds the header on the way out, and the secret never enters the VM.
- Copy only the files the task needs into the sandbox. Don't mount a volume that is shared with other tenants or with production.

## Layer 4: cap time and size

A sandbox without limits is a crypto miner or a fork bomb with a credit card attached. Set limits explicitly instead of relying on defaults:

- **Lifetime.** E2B and Modal both default to 5 minutes. E2B allows up to 1 hour of continuous runtime on the free tier and 24 hours on Pro; Modal allows up to 24 hours. Vercel's maximum session is 45 minutes on Hobby and 24 hours on Pro and Enterprise. Set the shortest timeout that fits the task, and a per-command timeout on top.
- **Size.** Request the smallest CPU and memory that work. Daytona's default sandbox is 1 vCPU, 1 GB RAM and 3 GiB disk; E2B's default is 2 vCPU and 4 GiB.
- **Concurrency and spend.** Cap the number of sandboxes per user in your own code, and set a billing alert with the provider.

## Layer 5: treat the output as untrusted

Whatever the sandbox returns (stdout, files, generated charts, URLs it found) came from code you don't trust. It can contain a prompt injection aimed at the next model call, or HTML and scripts aimed at your UI. Truncate long output before it goes back into the context window, render files as downloads rather than inline HTML, and don't let the agent turn sandbox output straight into a privileged tool call (a payment, a deploy, an email) without a check.

## Example: E2B with the network off

E2B's SDK creates a Firecracker microVM, runs commands in it and tears it down. Install the SDK and set `E2B_API_KEY`:

```bash
pip install e2b
export E2B_API_KEY=e2b_your_key
```

Run model-written code with no internet access and a short lifetime:

```python
from e2b import Sandbox

untrusted_code = "print(sum(range(10)))"  # whatever the model produced

# 120-second lifetime (Python uses seconds), no outbound network
sandbox = Sandbox.create(timeout=120, allow_internet_access=False)
try:
    sandbox.files.write("/tmp/main.py", untrusted_code)
    result = sandbox.commands.run("python3 /tmp/main.py", timeout=30)
    print(result.stdout[:4000])  # truncate before it goes back to the model
finally:
    sandbox.kill()
```

If you want a Jupyter-style "run this cell and give me the result" interface instead, E2B's code interpreter SDK (`pip install e2b-code-interpreter`) exposes `Sandbox.create()` and `sbx.run_code(...)`. Its kernel can run Python, JavaScript and TypeScript, R, Java and Bash.

## Example: Modal with an allowlist

Modal sandboxes are created from Python (or the JS and Go SDKs) against a Modal app. This one can only reach one API domain, has a 10-minute lifetime and uses a slim image:

```python
import modal

app = modal.App.lookup("agent-sandboxes", create_if_missing=True)

sb = modal.Sandbox.create(
    app=app,
    image=modal.Image.debian_slim().pip_install("requests"),
    timeout=10 * 60,
    outbound_domain_allowlist=["api.github.com"],  # beta feature
)
try:
    p = sb.exec("python", "-c", "print('hello from the sandbox')", timeout=30)
    print(p.stdout.read())
finally:
    sb.terminate()
```

Use `block_network=True` instead when the code needs no network at all. It can't be combined with the allowlists.

## Running it yourself

If code can't leave your infrastructure, or you want sandboxes on a developer laptop, [microsandbox](entry:microsandbox) is an Apache-2.0 microVM runtime that runs on Linux with KVM, Apple Silicon Macs and Windows. It has a CLI (`msb run ubuntu`), SDKs for Rust, TypeScript and Python, and an MCP server. The README reports average boot times under 100 ms. The trade-off is that you operate the hosts, patch them, and build your own scheduling and egress controls. E2B's runtime is also open source (Apache-2.0), and E2B (Enterprise), Daytona (Enterprise) and [Northflank](entry:northflank-sandboxes) (microVMs on Kata Containers or gVisor) offer bring-your-own-cloud deployments for teams that need sandboxes in their own VPC.

## Giving the sandbox to an agent as a tool

Most agent frameworks expect a tool shaped like "run this code, return the output". Wrap your sandbox call in that shape and keep the controls above inside the wrapper, not in the prompt. The model should not be able to switch the network back on by asking. If your agent speaks MCP, microsandbox ships an [MCP server](https://github.com/superradcompany/microsandbox-mcp) that lets an agent create its own sandboxes. E2B's original MCP server repository (e2b-dev/mcp-server) is archived, so don't build on it. Whatever you connect, read the tools it exposes first and run it with a key scoped to a project you can afford to lose.

## Checklist

- [ ] Code runs in a VM, gVisor or isolate boundary, never in your app's process or a shared-kernel container.
- [ ] One sandbox per task or session; never shared across users.
- [ ] Egress denied by default, with an allowlist or proxy if the task needs the network.
- [ ] No long-lived secrets inside the sandbox; credentials brokered at the network layer where possible.
- [ ] Lifetime, per-command timeout, CPU, memory and concurrency set explicitly.
- [ ] Output truncated and treated as untrusted before it reaches the model, the UI or another tool.
