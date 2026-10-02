---
id: code-sandboxes
type: comparison
title: Code sandboxes for AI agents
summary: E2B, Daytona, Modal, Vercel Sandbox, Cloudflare Sandboxes, Fly.io Sprites and microsandbox compared on isolation, pricing, free tier, lifetime, persistence, egress controls, SDKs, GPUs and self-hosting.
description: "A primary-source comparison of seven places to run agent-generated code. Prices are list prices from each vendor's pricing page on 2026-10-02, converted to per-vCPU-hour and per-GiB-hour where the vendor bills per second. Billing models differ (provisioned versus active CPU, physical cores versus vCPUs), so estimate with your own workload before choosing on price."
author: Agentica Author
tags: [sandboxes, code-execution, infrastructure, security, microvm]
entries: [e2b, daytona, modal, vercel-sandbox, cloudflare-sandbox, fly-io, microsandbox, northflank-sandboxes]
subjects: [e2b, daytona, modal, vercel-sandbox, cloudflare-sandbox, fly-io, microsandbox]
criteria:
  - Isolation
  - Compute price
  - Free allowance
  - Lifetime
  - Persistence
  - Egress controls
  - SDKs
  - GPUs
  - Self-host or BYOC
rows:
  e2b:
    Isolation: Firecracker microVM with its own kernel
    Compute price: "$0.0504/vCPU-h and $0.0162/GiB-h, billed per second on provisioned size (default 2 vCPU, 4 GiB); Pro plan $150/mo"
    Free allowance: Hobby plan with a one-time $100 usage credit; 20 concurrent sandboxes
    Lifetime: "Default 5 min; up to 1 h continuous (Hobby) or 24 h (Pro). Pausing resets the window"
    Persistence: Pause and resume keeps filesystem and memory; paused sandboxes kept indefinitely; volumes
    Egress controls: "On by default; allow_internet_access=False, or allow/deny lists of IPs, CIDRs and domains; BYO SOCKS5 proxy; secret injection at the egress proxy"
    SDKs: Python, JavaScript/TypeScript (plus a code interpreter SDK)
    GPUs: Not offered
    Self-host or BYOC: Runtime is open source (Apache-2.0); BYOC on AWS, GCP and Azure on Enterprise ($3k/mo minimum)
  daytona:
    Isolation: OCI container by default; VM sandboxes (Linux, Windows, nested KVM), macOS and GPU sandboxes available
    Compute price: "$0.0504/vCPU-h, $0.0162/GiB-h, storage $0.000108/GiB-h after 5 GiB free; billed per second"
    Free allowance: $200 of free compute
    Lifetime: "Runs until stopped; auto-stop after 15 min of inactivity by default, plus auto-archive and auto-delete"
    Persistence: Stopped and archived sandboxes keep their filesystem; snapshots and fork
    Egress controls: "Set by org tier (Tier 1-2 restricted, Tier 3-4 open); per sandbox network_block_all, CIDR allowlist, domain allowlist or outbound proxy, changeable at runtime"
    SDKs: Python, TypeScript, Go, Java, Ruby
    GPUs: "Yes, up to 8 GPUs per sandbox (e.g. H100 $2.27/h preemptible, $3.95/h on-demand)"
    Self-host or BYOC: "BYOC on Enterprise. The public AGPL-3.0 repo is no longer maintained (since June 2026)"
  modal:
    Isolation: "gVisor by default; optional runtime=\"vm\" with its own Linux kernel"
    Compute price: "$0.00003942 per physical core per second (1 core = 2 vCPU, about $0.071/vCPU-h) and $0.024/GiB-h"
    Free allowance: Starter plan includes $30/month of credits
    Lifetime: Default 5 min, maximum 24 h; idle_timeout optional
    Persistence: "Filesystem snapshots (30-day default TTL since Python SDK 1.5), memory snapshots (7 days), volumes"
    Egress controls: "block_network=True, outbound CIDR allowlist, domain allowlist (beta), runtime policy updates (alpha), sidecar proxy"
    SDKs: Python; JavaScript and Go (beta)
    GPUs: "Yes, with the gVisor runtime"
    Self-host or BYOC: Not offered
  vercel-sandbox:
    Isolation: Firecracker microVM
    Compute price: "$0.128 per active CPU-hour and $0.0212/GB-h provisioned memory (iad1), plus $0.60 per 1M creations"
    Free allowance: "Hobby: 5 active CPU-hours, 420 GB-hours memory and 5,000 creations per month"
    Lifetime: "Default 5 min; max session 45 min (Hobby) or 24 h (Pro, Enterprise). Persistent sandboxes resume, so total lifetime is unbounded"
    Persistence: "Persistent by default (state saved on stop); snapshots; Drives (beta)"
    Egress controls: "allow-all (default), deny-all, or user-defined domain and CIDR policy, updatable at runtime; credential brokering and request forwarding"
    SDKs: JavaScript/TypeScript, Python, CLI
    GPUs: Not mentioned in the sources used
    Self-host or BYOC: Not offered
  cloudflare-sandbox:
    Isolation: "Containers: Linux VM with its own kernel, started by a Durable Object. Dynamic Workers: V8 isolates for JS, Python and Wasm"
    Compute price: "$0.000020/vCPU-s active CPU (about $0.072/vCPU-h), $0.0000025/GiB-s provisioned memory, billed per 10 ms; needs Workers Paid ($5/mo)"
    Free allowance: "Workers Paid includes 375 vCPU-min, 25 GiB-h memory and 200 GB-h disk per month"
    Lifetime: Runs while its Durable Object is active, then for an inactivity timeout of up to 6 h
    Persistence: "Disk is lost when the instance stops unless you snapshot it (up to 20 GB, kept 30 days) or back up to R2"
    Egress controls: "Containers: internet can be disabled and outbound HTTP intercepted by the Worker. Dynamic Workers: globalOutbound null blocks all"
    SDKs: "@cloudflare/sandbox (TypeScript, from a Worker); SDK 0.x is legacy"
    GPUs: Not offered
    Self-host or BYOC: Not offered
  fly-io:
    Isolation: Sprites run in Firecracker VMs on isolated networks
    Compute price: "Sprites: $0.03825 per CPU-hour of actual CPU use and $0.021875 per GB-hour of actual memory (from 2026-10-01)"
    Free allowance: "$30 trial credit; optional plans from $20/mo (20 active Sprites) to $2,000/mo"
    Lifetime: Persistent; sleeps when idle (no compute billed) and wakes on request
    Persistence: "100 GB ext4 volume that survives sleep; automatic and manual checkpoints, restore in about a second"
    Egress controls: "Connectors for external services without holding the secret; an egress allowlist is not documented in the sources used"
    SDKs: "JavaScript, Go, Python, Elixir, CLI, REST API"
    GPUs: Not mentioned in the sources used
    Self-host or BYOC: Not offered
  microsandbox:
    Isolation: Local microVM (KVM on Linux, Apple Silicon on macOS; Windows also supported)
    Compute price: Free (Apache-2.0); you pay for your own hardware
    Free allowance: n/a (open source)
    Lifetime: You decide
    Persistence: Snapshots, fork and volumes
    Egress controls: Your own responsibility on the host
    SDKs: "Rust, TypeScript, Python, msb CLI; MCP server and Agent Skills"
    GPUs: Not mentioned in the sources used
    Self-host or BYOC: Self-hosted by design
verdict: "For a default hosted choice, E2B and Vercel Sandbox give a microVM per task with mature egress controls; E2B suits Python-first agents and pause/resume workflows, Vercel suits teams already on Vercel and bursty, low-CPU agents billed on active CPU. Pick Modal or Daytona if you need GPUs or a broad SDK set, Cloudflare if your agent already runs on Workers, Fly.io Sprites for long-lived persistent agent computers, and microsandbox when code must stay on your own machines."
sources:
  - title: E2B pricing
    url: https://e2b.dev/pricing
    accessed: 2026-10-02
  - title: E2B docs, Sandbox lifecycle
    url: https://docs.e2b.dev/sandbox
    accessed: 2026-10-02
  - title: E2B docs, Sandbox persistence
    url: https://docs.e2b.dev/sandbox/persistence
    accessed: 2026-10-02
  - title: E2B docs, Internet access
    url: https://docs.e2b.dev/network/internet-access
    accessed: 2026-10-02
  - title: E2B runtime repository
    url: https://github.com/e2b-dev/runtime
    accessed: 2026-10-02
  - title: Daytona pricing
    url: https://www.daytona.io/pricing
    accessed: 2026-10-02
  - title: Daytona docs, Sandboxes
    url: https://www.daytona.io/docs/en/sandboxes
    accessed: 2026-10-02
  - title: Daytona docs, Network Limits (Firewall)
    url: https://www.daytona.io/docs/en/network-limits
    accessed: 2026-10-02
  - title: daytonaio/daytona repository (maintenance notice)
    url: https://github.com/daytonaio/daytona
    accessed: 2026-10-02
  - title: Modal pricing
    url: https://modal.com/pricing
    accessed: 2026-10-02
  - title: Modal docs, Sandboxes
    url: https://modal.com/docs/guide/sandboxes
    accessed: 2026-10-02
  - title: Modal docs, Sandbox networking and security
    url: https://modal.com/docs/guide/sandbox-networking
    accessed: 2026-10-02
  - title: Modal docs, Sandbox snapshots
    url: https://modal.com/docs/guide/sandbox-snapshots
    accessed: 2026-10-02
  - title: Vercel docs, Vercel Sandbox
    url: https://vercel.com/docs/sandbox
    accessed: 2026-10-02
  - title: Vercel docs, Sandbox pricing and limits
    url: https://vercel.com/docs/sandbox/pricing
    accessed: 2026-10-02
  - title: Vercel docs, Sandbox firewall
    url: https://vercel.com/docs/sandbox/concepts/firewall
    accessed: 2026-10-02
  - title: Cloudflare docs, Sandboxes
    url: https://developers.cloudflare.com/sandbox/
    accessed: 2026-10-02
  - title: Cloudflare docs, Sandbox lifetime
    url: https://developers.cloudflare.com/sandbox/concepts/lifetime/
    accessed: 2026-10-02
  - title: Cloudflare docs, Containers pricing
    url: https://developers.cloudflare.com/containers/platform/pricing/
    accessed: 2026-10-02
  - title: Cloudflare docs, Containers limits
    url: https://developers.cloudflare.com/containers/platform/limits/
    accessed: 2026-10-02
  - title: "Fly.io, Sprites: Linux computers for agents"
    url: https://fly.io/sprites
    accessed: 2026-10-02
  - title: Fly.io pricing
    url: https://fly.io/pricing/
    accessed: 2026-10-02
  - title: Fly.io 2026 pricing update (effective October 1, 2026)
    url: https://fly.io/pricing-update/
    accessed: 2026-10-02
  - title: microsandbox README
    url: https://github.com/superradcompany/microsandbox
    accessed: 2026-10-02
related: [run-untrusted-code-in-a-sandbox, coding-agent-starter, research-agent]
last_verified: 2026-10-02
published: 2026-10-02
---

## How to read this table

All seven products give agent code its own machine, but they bill and behave differently enough that the cheapest-looking line is often not the cheapest bill.

- **Provisioned versus active CPU.** [E2B](entry:e2b), [Daytona](entry:daytona) and [Modal](entry:modal) bill CPU for as long as the sandbox runs, at the size you asked for. [Vercel Sandbox](entry:vercel-sandbox) and [Cloudflare](entry:cloudflare-sandbox) bill CPU only while it is busy (memory is still billed on provisioned size). [Fly.io](entry:fly-io) Sprites bill both CPU and memory on actual use. An agent that spends most of its time waiting for the model favors active-CPU billing.
- **Cores versus vCPUs.** Modal prices a physical core, which it counts as 2 vCPUs. The per-vCPU figure in the table divides by two.
- **Lifetime versus persistence.** A "24 hour" limit means something different on each platform. E2B and Vercel reset the clock when a sandbox pauses or stops and resumes, so a persistent workspace can live indefinitely. Modal's 24 hours is a hard sandbox lifetime; you continue from a snapshot. Cloudflare instances live as long as requests keep their Durable Object active, plus an inactivity timeout of up to 6 hours, and lose their disk on stop unless you snapshot.
- **Startup.** Vendors quote different numbers measured different ways (Daytona says under 90 ms, microsandbox reports under 100 ms average boot, Vercel says milliseconds). No independent benchmark was used for this page, so cold start is left out of the table. Measure it from your own region.

## Recent changes worth knowing

- **Daytona's open-source repo is frozen.** The daytonaio/daytona repository says it has not been maintained since June 2026 and that development moved to a private codebase. It stays public under AGPL-3.0, but don't plan on self-hosting the current product from it.
- **Modal added a VM runtime** alongside gVisor (`runtime="vm"`), for Docker-in-sandbox, FUSE and nested cgroups. GPU sandboxes still require gVisor. Filesystem snapshots now expire after 30 days by default (Python SDK 1.5, JS and Go 0.8.0).
- **Cloudflare reorganized Sandboxes** into two environments, Containers (Linux VMs) and Dynamic Workers (isolates). The `@cloudflare/sandbox` 0.x SDK is legacy and has a migration guide to 1.0.
- **Fly.io cut Sprites prices** on 2026-10-01, to $0.03825 per CPU-hour and $0.021875 per GB-hour. Some Fly pages still showed the older rates on the day this was checked; the pricing page and the pricing-update notice carry the new ones.
- **Vercel** made its full egress firewall available on the Hobby plan and stopped charging for data downloaded by sandboxes, according to its changelog.

## Picking one

Start from the constraint you can't change:

- **Code must not leave your machines:** [microsandbox](entry:microsandbox) locally, or a BYOC deployment of E2B, Daytona or [Northflank Sandboxes](entry:northflank-sandboxes) (microVMs on Kata Containers or gVisor, in Northflank's cloud or your VPC). Northflank is left out of the table because its sandbox pricing and limits weren't verified for this page beyond a quoted $0.01667 per vCPU-hour.
- **GPUs:** Modal or Daytona.
- **Your agent already runs on a platform:** Cloudflare Workers, Vercel or Modal, to keep latency, billing and secrets in one place.
- **Long-lived personal agent computers** that sleep and wake: Fly.io Sprites, E2B pause/resume, or Vercel persistent sandboxes.
- **Many short, bursty executions:** compare active-CPU billing (Vercel, Cloudflare, Sprites) against per-second provisioned billing with your real CPU utilization.

Whichever you choose, the provider only gives you the boundary. Egress policy, secrets, limits and output handling are yours to configure; the [sandboxing guide](guide:run-untrusted-code-in-a-sandbox) walks through each one.
