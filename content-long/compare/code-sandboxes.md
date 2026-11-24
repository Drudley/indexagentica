---
id: code-sandboxes
type: comparison
title: Code sandboxes for AI agents
summary: E2B, Daytona, Modal, Vercel Sandbox, Cloudflare Sandboxes, Fly.io Sprites, microsandbox, Render Sandboxes, Keln and Deno Sandbox compared on isolation, pricing, free tier, lifetime, persistence, egress controls, SDKs, GPUs and self-hosting.
description: "A primary-source comparison of ten places to run agent-generated code. Prices are list prices from each vendor's pricing page on 2026-10-02 (Render, Keln and Deno added 2026-11-24), converted to per-vCPU-hour and per-GiB-hour where the vendor bills per second. Billing models differ (provisioned versus active CPU, physical cores versus vCPUs), so estimate with your own workload before choosing on price."
author: Agentica Author
tags: [sandboxes, code-execution, infrastructure, security, microvm]
entries: [e2b, daytona, modal, vercel-sandbox, cloudflare-sandbox, fly-io, microsandbox, northflank-sandboxes, lizard-sandboxes, render-sandboxes, keln, deno-sandbox]
subjects: [e2b, daytona, modal, vercel-sandbox, cloudflare-sandbox, fly-io, microsandbox, render-sandboxes, keln, deno-sandbox]
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
  render-sandboxes:
    Isolation: "Managed, ephemeral isolated Linux environment with its own filesystem; the docs don't name the isolation technology. Public beta"
    Compute price: "$0.12 per CPU-hour of CPU actually used plus $0.019/GB-h provisioned memory; plans 1c-2g (default) to 8c-16g"
    Free allowance: None stated on the limits and pricing page
    Lifetime: "Runtime timeout defaults to 24 h, max 30 days, or disabled; idle timeout defaults to 15 min (max 24 h) and suspends, not deletes"
    Persistence: "Suspended sandboxes resumable for 30 days (not billed); filesystem and runtime snapshots; 40 GB writable disk"
    Egress controls: "Allow-all by default; allowlist of HTTPS destinations or no egress. No private networking to other Render services yet (beta)"
    SDKs: "Render CLI 2.34.0+, TypeScript @renderinc/sdk 1.9.0+, Python 1.9.0+ (Python 3.11+)"
    GPUs: Not mentioned in the sources used
    Self-host or BYOC: "Not offered; one region (Oregon)"
  keln:
    Isolation: Each sandbox in its own microVM
    Compute price: "$0.0504/vCPU-h and $0.0162/GiB-h, per second while running (default 2 vCPU, 2 GiB is $0.133/h); images $0.08/GB-month"
    Free allowance: "None stated; prepaid balance shared with Keln inference. 3 running sandboxes until the first paid top-up, then 100"
    Lifetime: Default 5 min (timeout_s); max 24 h from creation or last resume
    Persistence: "Pause keeps memory, processes and files; paused time and snapshots not billed; paused sandboxes kept up to 30 days"
    Egress controls: "Internet on by default; internet false plus an allow list, or a deny list of domains, IPv4s and CIDRs; port 25 always blocked"
    SDKs: HTTP API at sandbox.keln.ai (the docs show curl; no SDK listed)
    GPUs: Not mentioned in the sources used
    Self-host or BYOC: Not offered
  deno-sandbox:
    Isolation: Linux microVM orchestrated by Deno Deploy
    Compute price: "Deno Deploy plans: Free $0, Pro $20/mo, Builder $200/mo; a sandbox meter isn't broken out on the pricing page"
    Free allowance: "Not stated for sandboxes; default 5 concurrent sandboxes per organization during pre-release"
    Lifetime: Configurable per sandbox and bound to a session, up to 30 min
    Persistence: "Ephemeral 10 GB disk, torn down after use; durable storage through volumes"
    Egress controls: "allowNet host allowlist; secrets never enter the sandbox and are substituted only on outbound requests to approved hosts"
    SDKs: "@deno/sandbox (JavaScript/TypeScript, MIT) and a Python SDK"
    GPUs: Not mentioned in the sources used
    Self-host or BYOC: "Not offered; regions ams and ord. Deno Deploy sunsets in April 2027"
verdict: "Default hosted pick: E2B or Vercel Sandbox, each a microVM per task with mature egress controls (E2B for Python-first agents and pause/resume, Vercel for bursty low-CPU agents on active-CPU billing). Modal or Daytona for GPUs, Cloudflare if you run on Workers, Fly.io Sprites for persistent agent computers, microsandbox to stay on your machines. Render Sandboxes (beta) suits long-lived, mostly idle agents; Keln matches E2B rates on a prepaid balance; skip Deno Sandbox for new work given the April 2027 Deploy sunset."
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
  - title: Render docs, Intro to Render Sandboxes
    url: https://render.com/docs/sandboxes
    accessed: 2026-11-24
  - title: Render docs, Limits and Pricing for Render Sandboxes
    url: https://render.com/docs/sandboxes-limits
    accessed: 2026-11-24
  - title: Render docs, Creating and Configuring Sandboxes
    url: https://render.com/docs/sandboxes-creating
    accessed: 2026-11-24
  - title: Keln docs, Sandboxes overview
    url: https://docs.keln.ai/sandboxes/
    accessed: 2026-11-24
  - title: Keln docs, Network policy
    url: https://docs.keln.ai/sandboxes/network/
    accessed: 2026-11-24
  - title: Deno docs, Deno Sandbox
    url: https://docs.deno.com/sandbox/
    accessed: 2026-11-24
  - title: Deno Deploy pricing
    url: https://deno.com/deploy/pricing
    accessed: 2026-11-24
  - title: "Deno blog, the Deno team is joining Cloudflare"
    url: https://deno.com/blog/cloudflare
    accessed: 2026-11-24
related: [run-untrusted-code-in-a-sandbox, coding-agent-starter, research-agent, self-hosted-agent-sandboxes, self-host-a-code-execution-api]
last_verified: 2026-11-24
published: 2026-10-02
---

## How to read this table

All ten products give agent code its own machine, but they bill and behave differently enough that the cheapest-looking line is often not the cheapest bill.

- **Provisioned versus active CPU.** [E2B](entry:e2b), [Daytona](entry:daytona) and [Modal](entry:modal) bill CPU for as long as the sandbox runs, at the size you asked for. [Vercel Sandbox](entry:vercel-sandbox) and [Cloudflare](entry:cloudflare-sandbox) bill CPU only while it is busy (memory is still billed on provisioned size). [Fly.io](entry:fly-io) Sprites bill both CPU and memory on actual use. [Render Sandboxes](entry:render-sandboxes) bill CPU on actual use and memory on provisioned size, like Vercel; [Keln](entry:keln) bills provisioned size per second, at the same rates as E2B. An agent that spends most of its time waiting for the model favors active-CPU billing.
- **Cores versus vCPUs.** Modal prices a physical core, which it counts as 2 vCPUs. The per-vCPU figure in the table divides by two.
- **Lifetime versus persistence.** A "24 hour" limit means something different on each platform. E2B and Vercel reset the clock when a sandbox pauses or stops and resumes, so a persistent workspace can live indefinitely. Keln's 24 hours also restarts on resume. Render's runtime timeout can be raised to 30 days or switched off. [Deno Sandbox](entry:deno-sandbox) caps a session at 30 minutes. Modal's 24 hours is a hard sandbox lifetime; you continue from a snapshot. Cloudflare instances live as long as requests keep their Durable Object active, plus an inactivity timeout of up to 6 hours, and lose their disk on stop unless you snapshot.
- **Startup.** Vendors quote different numbers measured different ways (Daytona says under 90 ms, microsandbox reports under 100 ms average boot, Vercel says milliseconds). No independent benchmark was used for this page, so cold start is left out of the table. Measure it from your own region.

## Recent changes worth knowing

- **Daytona's open-source repo is frozen.** The daytonaio/daytona repository says it has not been maintained since June 2026 and that development moved to a private codebase. It stays public under AGPL-3.0, but don't plan on self-hosting the current product from it.
- **Modal added a VM runtime** alongside gVisor (`runtime="vm"`), for Docker-in-sandbox, FUSE and nested cgroups. GPU sandboxes still require gVisor. Filesystem snapshots now expire after 30 days by default (Python SDK 1.5, JS and Go 0.8.0).
- **Cloudflare reorganized Sandboxes** into two environments, Containers (Linux VMs) and Dynamic Workers (isolates). The `@cloudflare/sandbox` 0.x SDK is legacy and has a migration guide to 1.0.
- **Fly.io cut Sprites prices** on 2026-10-01, to $0.03825 per CPU-hour and $0.021875 per GB-hour. Some Fly pages still showed the older rates on the day this was checked; the pricing page and the pricing-update notice carry the new ones.
- **Render Sandboxes launched in public beta** on 2026-11-04. Render says APIs, defaults and limits may change during the beta, there is one region (Oregon), and sandboxes can't yet reach other Render services over private networking.
- **Deno Deploy is being sunset in April 2027.** The Deno pricing page shows the banner, and Deno's 9 October announcement says the team is joining Cloudflare. Deno Sandbox runs on Deploy and is still in pre-release (5 concurrent sandboxes per organization by default), so treat it as short-term.
- **Keln** has sandboxes next to its open-model inference API. They share API keys and prepaid credit. If the balance runs out, running sandboxes stop after 60 seconds. That is a hard spend cap, but it can also kill a job partway through.
- **Vercel** made its full egress firewall available on the Hobby plan and stopped charging for data downloaded by sandboxes, according to its changelog.

## Picking one

Start from the constraint you can't change:

- **Code must not leave your machines:** [microsandbox](entry:microsandbox) locally, or a BYOC deployment of E2B, Daytona or [Northflank Sandboxes](entry:northflank-sandboxes) (microVMs on Kata Containers or gVisor, in Northflank's cloud or your VPC). Northflank is left out of the table because its sandbox pricing and limits weren't verified for this page beyond a quoted $0.01667 per vCPU-hour.
- **GPUs:** Modal or Daytona.
- **Your agent already runs on a platform:** Cloudflare Workers, Vercel or Modal, to keep latency, billing and secrets in one place.
- **Long-lived personal agent computers** that sleep and wake: Fly.io Sprites, E2B or Keln pause/resume, Vercel persistent sandboxes, or Render's idle suspension.
- **Many short, bursty executions:** compare active-CPU billing (Vercel, Cloudflare, Sprites, Render) against per-second provisioned billing with your real CPU utilization.

Whichever you choose, the provider only gives you the boundary. Render and Keln allow all outbound traffic by default, so set an allowlist before running untrusted code. Egress policy, secrets, limits and output handling are yours to configure; the [sandboxing guide](guide:run-untrusted-code-in-a-sandbox) walks through each one.
