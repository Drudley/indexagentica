---
id: self-hosted-agent-sandboxes
type: comparison
title: Self-hosted sandboxes for agents compared
summary: "Six ways to isolate agent-run code on hardware you control (OpenSandbox, AIO Sandbox, microsandbox, Kubernetes Agent Sandbox, Anthropic's sandbox-runtime and Docker Sandboxes' local mode) compared on isolation, where they run, agent interface, network and secret controls, maturity and license."
description: "A primary-source comparison of sandboxes you can run yourself, from an OS-level process wrapper to microVMs on a laptop to Kubernetes-scale platforms. It explains which boundary each one actually provides and which defaults to change before an agent uses it. Hosted sandbox services are covered in the code sandboxes comparison."
author: Agentica Author
tags: [sandbox, self-hosted, code-execution, microvm, kubernetes, security, isolation, infrastructure]
entries: [opensandbox, aio-sandbox, microsandbox, kubernetes-agent-sandbox, sandbox-runtime, docker-sandboxes, microsandbox-mcp, e2b, daytona, e2b-desktop, cua, claude-code, kubernetes-mcp-server]
related: [code-sandboxes, run-untrusted-code-in-a-sandbox, coding-agent-harnesses, devops-mcp-servers, cloud-browsers-for-agents, coding-agent-starter]
subjects: [opensandbox, aio-sandbox, microsandbox, kubernetes-agent-sandbox, sandbox-runtime, docker-sandboxes]
criteria:
  - Isolation boundary
  - Runs on
  - Agent interface
  - Network and secrets
  - Maturity
  - License
rows:
  opensandbox:
    Isolation boundary: "Docker containers locally; on Kubernetes, the Fast Sandbox runtime uses Firecracker microVMs (README: 64 ms P50 creation, serial) with pause/resume of memory and disk"
    Runs on: "Your Docker host to start (uvx opensandbox-server), then Kubernetes through the same lifecycle API, with resource pools and batch creation"
    Agent interface: "Lifecycle and execution APIs; SDKs for Python, Java/Kotlin, TypeScript, C#/.NET and Go; osb CLI; MCP server; examples for coding agents, browsers and desktops"
    Network and secrets: "Unified ingress gateway, per-sandbox egress policies, Credential Vault so sandboxed code can call services without seeing real credentials"
    Maturity: "Latest release tag release-1.1.1 (2026-10-09); release images signed with Cosign; listed in the CNCF Landscape"
    License: "Apache-2.0"
  aio-sandbox:
    Isolation boundary: "One Docker container holding browser, shell, files, VS Code Server, Jupyter and MCP; the README's run commands disable seccomp (--security-opt seccomp=unconfined)"
    Runs on: "Any Docker host (ghcr.io/agent-infra/sandbox); for cloud use, keep port 8080 private behind a reverse proxy or Ingress"
    Agent interface: "HTTP API (docs at /v1/docs), MCP at /mcp, VNC browser, VS Code Server; SDKs for Python (agent-sandbox), TypeScript (@agent-infra/sandbox) and Go"
    Network and secrets: "Optional SANDBOX_API_KEY protects every service (header, bearer or query parameter); without it the services are open; no egress policy documented in the README"
    Maturity: "Latest release v1.11.0 (2026-06-23); pin release tags for reproducible deployments"
    License: "Apache-2.0"
  microsandbox:
    Isolation boundary: "Local microVMs; README reports average guest boot under 100 ms (on an M1)"
    Runs on: "macOS on Apple Silicon, Linux with KVM, Windows with WHP; the SDK boots a VM as a child process, no server or daemon"
    Agent interface: "msb CLI; SDKs for TypeScript, Rust, Python, Go and Ruby; MCP server (microsandbox-mcp); Agent Skills so agents can create their own sandboxes"
    Network and secrets: "Per-sandbox host and port allowlists; secrets bound to an allowed host that, per the README, never enter the VM"
    Maturity: "Beta: the README warns of breaking changes and rough edges; latest release v0.7.8 (2026-10-09)"
    License: "Apache-2.0"
  kubernetes-agent-sandbox:
    Isolation boundary: "Delegated: a Sandbox is a pod using a RuntimeClass such as gVisor or Kata Containers; the project orchestrates, it does not isolate by itself"
    Runs on: "Any Kubernetes cluster (Sandbox CRD and controller under SIG Apps), installed with kubectl apply"
    Agent interface: "Kubernetes resources (Sandbox, SandboxTemplate, SandboxClaim, SandboxWarmPool); Go and Python SDKs; optional Sandbox Router HTTP proxy to reach sandbox pods"
    Network and secrets: "Stable hostname and network identity per sandbox; network and secret policy is whatever your cluster and runtime enforce"
    Maturity: "Latest release v1.0.7 (2026-10-15)"
    License: "Apache-2.0"
  sandbox-runtime:
    Isolation boundary: "OS-level, no container or VM: sandbox-exec (Seatbelt) on macOS, bubblewrap with network namespace removal on Linux, a dedicated local user plus a Windows Filtering Platform fence on Windows"
    Runs on: "The developer's own machine, wrapping one process tree (an agent, a local MCP server, a shell command)"
    Agent interface: "srt CLI (srt \"command\") and a library; npm install -g @anthropic-ai/sandbox-runtime; can wrap MCP servers in .mcp.json"
    Network and secrets: "Network deny-by-default through host proxies with allowedDomains / deniedDomains; writes deny-by-default (allowWrite); reads allowed everywhere unless you add denyRead"
    Maturity: "Beta research preview built for Claude Code; latest release v0.0.81 (2026-10-20)"
    License: "Apache-2.0"
  docker-sandboxes:
    Isolation boundary: "microVM per sandbox"
    Runs on: "Your machine (free, including commercial use) or Docker-managed cloud compute (metered); sbx move recreates a sandbox's files on the other side"
    Agent interface: "sbx CLI with presets for coding agents (Claude Code, Codex, Copilot, Cursor, Gemini, OpenCode and others); MCP gateway; Sandboxes API and SDK for cloud sandboxes"
    Network and secrets: "Network policies and credential handling per environment (local and cloud are separate); org-wide network, filesystem and MCP policies are a paid add-on"
    Maturity: "Generally available product from Docker"
    License: "proprietary"
verdict: "For one developer's coding agent, start with Docker Sandboxes (microVMs, free locally) or microsandbox (microVMs in your own code). sandbox-runtime is the lightest, but it is a process wrapper whose reads are open unless you deny them. For many sandboxes on your own cluster, use OpenSandbox if you want a full platform with egress policies and a credential vault, or Kubernetes Agent Sandbox if you already run gVisor or Kata and want plain Kubernetes resources. Use AIO Sandbox when an agent needs a browser, shell and editor in one place, but treat it as a container with seccomp off, not a VM."
sources:
  - {title: OpenSandbox README, url: "https://github.com/opensandbox-group/OpenSandbox", accessed: 2026-10-20}
  - {title: OpenSandbox website, url: "https://open-sandbox.ai/", accessed: 2026-10-20}
  - {title: AIO Sandbox README, url: "https://github.com/agent-infra/sandbox", accessed: 2026-10-20}
  - {title: AIO Sandbox website, url: "https://sandbox.agent-infra.com/", accessed: 2026-10-20}
  - {title: microsandbox README, url: "https://github.com/superradcompany/microsandbox", accessed: 2026-10-20}
  - {title: Kubernetes Agent Sandbox README, url: "https://github.com/kubernetes-sigs/agent-sandbox", accessed: 2026-10-20}
  - {title: Anthropic sandbox-runtime README, url: "https://github.com/anthropics/sandbox-runtime", accessed: 2026-10-20}
  - {title: Docker Sandboxes docs, url: "https://docs.docker.com/ai/sandboxes/", accessed: 2026-10-20}
  - {title: Docker Sandboxes product page, url: "https://www.docker.com/products/docker-sandboxes/", accessed: 2026-10-20}
last_verified: 2026-10-20
published: 2026-10-20
---

## What this covers

These sandboxes run on machines you control: a laptop, a server or your own Kubernetes cluster. Hosted services such as [E2B](entry:e2b) and [Daytona](entry:daytona) are compared in [code sandboxes](comparison:code-sandboxes). [Run untrusted code in a sandbox](guide:run-untrusted-code-in-a-sandbox) explains why an agent needs one at all.

Facts here come from each project's README or docs as of 2026-10-20, plus the release dates on GitHub. Unlike the [DevOps MCP servers comparison](comparison:devops-mcp-servers), we did not run these sandboxes for this piece. Boot-time figures are each project's own.

## The boundary is the main difference

The six fall into three groups, from strongest to weakest isolation:

- **A virtual machine per sandbox.** [microsandbox](entry:microsandbox), [Docker Sandboxes](entry:docker-sandboxes) and [OpenSandbox's](entry:opensandbox) Fast Sandbox runtime on Kubernetes give each sandbox its own guest kernel. Code that escapes a process still has to break out of a VM.
- **Whatever runtime you configure.** [Kubernetes Agent Sandbox](entry:kubernetes-agent-sandbox) manages pods and leaves isolation to a `RuntimeClass` such as gVisor or Kata Containers. Its README is explicit that it orchestrates and does not isolate by itself. On the default runtime, a Sandbox is an ordinary container.
- **A container or a process wrapper.** OpenSandbox's local Docker mode and [AIO Sandbox](entry:aio-sandbox) are containers. AIO's documented `docker run` lines add `--security-opt seccomp=unconfined`, which removes Docker's default system-call filter. Anthropic's [sandbox-runtime](entry:sandbox-runtime) (`srt`) uses no container at all. It restricts one process tree with Seatbelt on macOS, bubblewrap on Linux, or a dedicated user account and firewall rules on Windows.

Choose the boundary based on what the agent runs. Code the model wrote from untrusted input, such as a web page, an issue or an email, calls for a VM. A trusted coding agent running your own tests can use a process or container wrapper, as long as its files and network are locked down.

## Defaults to change before an agent uses it

- **sandbox-runtime reads are open.** By default, network access and writes are denied, but reads are allowed everywhere. Add `denyRead` entries for places like `~/.ssh` and other credential folders (the README's example blocks `~/.ssh/id_rsa`). Network traffic goes through proxies on the host that enforce `allowedDomains` and `deniedDomains`, covering both HTTP(S) and other TCP traffic.
- **AIO Sandbox is open without a key.** If `SANDBOX_API_KEY` is not set, the API, MCP endpoint, VNC and Jupyter accept anyone who can reach port 8080. The README binds the port to `127.0.0.1` for that reason. Set the key, and in the cloud put the container behind a reverse proxy or Ingress instead of publishing the port.
- **Egress is opt-in almost everywhere.** OpenSandbox has per-sandbox egress policies, and microsandbox has host and port allowlists per sandbox. Docker Sandboxes has network policies, with central org policies as a paid add-on. For Kubernetes Agent Sandbox, use your cluster's NetworkPolicies. Without one of these, an agent that reads a malicious page can send your data anywhere.
- **Keep real secrets out of the sandbox.** OpenSandbox's Credential Vault and microsandbox's host-bound secrets both aim to let sandboxed code call an API without ever holding the real key. Prefer that over passing tokens as environment variables.

## How agents drive them

- **MCP:** OpenSandbox, AIO Sandbox (at `/mcp`) and microsandbox ([microsandbox-mcp](entry:microsandbox-mcp)) expose sandboxes as MCP tools, so any MCP client can create one and run code in it. Docker Sandboxes takes the opposite approach: its MCP gateway gives MCP servers to the agent running inside the sandbox.
- **SDKs:** OpenSandbox (Python, Java/Kotlin, TypeScript, C#/.NET, Go), microsandbox (TypeScript, Rust, Python, Go, Ruby), AIO Sandbox (Python, TypeScript, Go) and Kubernetes Agent Sandbox (Go, Python).
- **Wrap the whole agent:** Docker Sandboxes' `sbx` and `srt` put the coding agent itself inside the sandbox ([Claude Code](entry:claude-code), Codex and others) rather than giving the agent a tool. For the harness side, see [coding agent harnesses compared](comparison:coding-agent-harnesses).
- **Desktops and browsers:** AIO Sandbox puts a VNC browser next to the shell with a shared file system. For full desktops, see [E2B Desktop](entry:e2b-desktop) and [Cua](entry:cua).

## Scale and evaluation workloads

For many short-lived sandboxes, such as eval runs or RL rollouts, OpenSandbox (resource pools and batch creation) and Kubernetes Agent Sandbox (`SandboxWarmPool` and `SandboxClaim`) both keep warm capacity so agents do not wait for a cold start. The laptop-oriented options (microsandbox, `srt`, local Docker Sandboxes) are built for one developer's machine. Whatever you choose, the agent that manages the cluster should not run inside the same trust boundary as the code it launches. The [DevOps MCP servers comparison](comparison:devops-mcp-servers) covers giving an agent read-only access to Kubernetes through the [Kubernetes MCP Server](entry:kubernetes-mcp-server).
