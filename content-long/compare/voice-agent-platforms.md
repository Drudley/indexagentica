---
id: voice-agent-platforms
type: comparison
title: "LiveKit Agents vs Pipecat vs OpenAI Realtime vs ElevenAgents vs Vapi: building voice agents"
summary: "Five ways to give an agent a voice compared: two open-source realtime frameworks (LiveKit Agents, Pipecat), a speech-to-speech model API (OpenAI Realtime) and two hosted voice-agent platforms (ElevenAgents, Vapi). Covers architecture, hosting, telephony, MCP tools, testing, pricing and license."
description: "A primary-source comparison checked on 2026-10-23 against each project's README, docs and pricing page (LiveKit Agents 1.8.8, Pipecat 1.13.0). It separates frameworks you run yourself from hosted platforms and model APIs, shows how each one connects to phone lines and MCP tool servers, and lists what you pay for. Latency figures are vendor claims and were not measured here."
author: Agentica Author
tags: [voice, realtime, telephony, speech-to-speech, webrtc, mcp, agents]
entries: [livekit-agents, pipecat, openai-realtime-api, elevenagents, vapi, openai-agents-sdk, model-context-protocol, zapier-mcp, composio]
related: [coding-agent-harnesses, connect-an-agent-to-a-remote-mcp-server, evaluate-an-ai-agent, mcp-gateways, give-your-coding-agent-up-to-date-docs]
subjects: [livekit-agents, pipecat, openai-realtime-api, elevenagents, vapi]
criteria:
  - What it is
  - Architecture
  - Run it where
  - Telephony
  - MCP tools
  - Testing and evals
  - Pricing (2026-10-23)
  - License
rows:
  livekit-agents:
    What it is: "Open-source framework for realtime voice/video agents that join LiveKit rooms as server-side participants (Python; JS/TS in agents-js)"
    Architecture: "Either a cascaded pipeline (pluggable STT, LLM, TTS) or a speech-to-speech realtime model plugin; transformer-based semantic turn detection; job dispatch to workers"
    Run it where: "Self-host the framework and the open-source LiveKit media server, or deploy to LiveKit Cloud (managed hosting, observability, LiveKit Inference)"
    Telephony: "Inbound and outbound phone calls through LiveKit's SIP stack; Cloud also has Twilio and WhatsApp connectors"
    MCP tools: "Native: add MCP server tools to an agent 'with one line of code' (README)"
    Testing and evals: "Built-in test framework with LLM judges; Cloud adds text and audio simulations"
    Pricing (2026-10-23): "Framework free. LiveKit Cloud Build plan $0 (1,000 agent session minutes, 5 concurrent sessions, $2.50 inference credits); Ship from $50/mo; Scale from $500/mo"
    License: "Apache-2.0"
  pipecat:
    What it is: "Open-source Python framework from Daily for realtime voice and multimodal agents, from one bot to multi-agent systems"
    Architecture: "Pipelines of processors (transport, STT, LLM, TTS) over WebRTC or WebSocket; supports speech-to-speech services too; Pipecat Flows for structured conversations; pipelines compose into multi-agent setups (handoff, fan-out, sidecars)"
    Run it where: "Anywhere you run Python, or Pipecat Cloud (Daily) for managed hosting with unlimited concurrency"
    Telephony: "Dial-in/dial-out over PSTN and SIP with Daily, Twilio, Telnyx, Plivo and Exotel"
    MCP tools: "MCPClient registers an MCP server's tools with your LLM; pipecat-mcp-transport can also serve a bot as an MCP server"
    Testing and evals: "Scripted scenarios with assertions on events, function calls and latency budgets; Whisker debugger"
    Pricing (2026-10-23): "Framework free. Pipecat Cloud agent-1x $0.01 per active minute (reserved $0.0005/min); Daily 1:1 WebRTC voice free on Pipecat Cloud; PSTN $0.018/min; AI providers billed by them"
    License: "BSD-2-Clause"
  openai-realtime-api:
    What it is: "OpenAI's speech-to-speech model API; the model hears and speaks audio directly and keeps conversation state"
    Architecture: "Single speech-to-speech model (e.g. gpt-realtime-2.1) with server VAD, interruptions, function and MCP tools; Agents SDK RealtimeAgent/RealtimeSession on top"
    Run it where: "OpenAI-hosted model; browsers connect over WebRTC with ephemeral client secrets, servers over WebSocket. You host your own app and tool backend"
    Telephony: "SIP connection or an application audio bridge (OpenAI 'Telephony and SIP' guide)"
    MCP tools: "Yes: an mcp tool with server_url makes the Realtime API call a remote MCP server for you; function tools run in your code"
    Testing and evals: "None built into the API; use your own eval tooling"
    Pricing (2026-10-23): "Usage-based per input/output token across audio, text and image; prices listed per model"
    License: "Proprietary"
  elevenagents:
    What it is: "ElevenLabs' hosted platform for voice and multimodal agents (docs formerly under 'Agents Platform')"
    Architecture: "Cascaded: fine-tuned ASR, any LLM or a custom one, low-latency TTS (10,000+ voices) and a proprietary turn-taking model; or Eleven Realtime speech-to-speech models (OpenAI Realtime-compatible)"
    Run it where: "ElevenLabs-hosted; embed with the web widget, React, Swift, Kotlin or React Native SDKs, or the WebSocket API"
    Telephony: "SIP trunk, native Twilio integration, batch outbound calls"
    MCP tools: "Agents can connect to MCP servers as tools; a hosted MCP server lets you create and manage agents from MCP clients"
    Testing and evals: "Automated tests, A/B experiments on live traffic, conversation analysis and analytics"
    Pricing (2026-10-23): "Free: 15 call minutes, 4 concurrent calls. Paid plans from $6/mo (Starter) to $990/mo (Business); additional minutes $0.08; LLM and telephony at cost"
    License: "Proprietary"
  vapi:
    What it is: "Hosted voice-agent API for phone and web assistants built from your choice of transcriber, model and voice providers"
    Architecture: "Transcriber, model and voice providers orchestrated by Vapi (cascaded); assistants configured by dashboard or API"
    Run it where: "Vapi-hosted"
    Telephony: "Vapi phone numbers (1 included on pay-as-you-go), Vapi telephony/SIP; dedicated SIP on Premier"
    MCP tools: "Yes: an MCP tool imports all tools from a server at call start (Streamable HTTP; sends X-Call-Id/X-Chat-Id); Vapi also has its own MCP server for the Vapi API"
    Testing and evals: "Testing and simulation of calls before they reach customers; monitoring"
    Pricing (2026-10-23): "Pay-as-you-go $0.05/min Vapi hosting plus provider costs at no markup, $5 free credits, 4 concurrent calls; Core, Pro ($999/mo minimum) and Premier packages"
    License: "Proprietary"
verdict: "Use LiveKit Agents or Pipecat if you want to own the code and the deployment, swap STT/LLM/TTS vendors freely and self-host; LiveKit bundles the media server and a free cloud tier, Pipecat has the widest telephony-carrier list and composable multi-agent pipelines. Use the OpenAI Realtime API (directly or as a plugin inside either framework) when one speech-to-speech model with tool calling is enough. Use ElevenAgents or Vapi when you want a hosted voice agent on a phone number quickly, with testing and analytics included, and accept per-minute platform fees."
sources:
  - {title: LiveKit Agents README, url: "https://github.com/livekit/agents", accessed: 2026-10-23}
  - {title: LiveKit pricing, url: "https://livekit.com/pricing", accessed: 2026-10-23}
  - {title: LiveKit Agents docs, url: "https://docs.livekit.io/agents/", accessed: 2026-10-23}
  - {title: Pipecat README, url: "https://github.com/pipecat-ai/pipecat", accessed: 2026-10-23}
  - {title: Pipecat docs index (llms.txt), url: "https://docs.pipecat.ai/llms.txt", accessed: 2026-10-23}
  - {title: Pipecat Cloud pricing, url: "https://www.daily.co/pricing/pipecat-cloud/", accessed: 2026-10-23}
  - {title: "OpenAI: Getting started with the Realtime API", url: "https://developers.openai.com/api/docs/guides/realtime", accessed: 2026-10-23}
  - {title: "OpenAI: Realtime with tools", url: "https://developers.openai.com/api/docs/guides/realtime-mcp", accessed: 2026-10-23}
  - {title: "OpenAI: Voice cost optimization", url: "https://developers.openai.com/api/docs/guides/voice-latency-cost", accessed: 2026-10-23}
  - {title: ElevenAgents overview, url: "https://elevenlabs.io/docs/eleven-agents/overview", accessed: 2026-10-23}
  - {title: ElevenAgents pricing, url: "https://elevenlabs.io/pricing/agents", accessed: 2026-10-23}
  - {title: "ElevenLabs docs index (llms.txt)", url: "https://elevenlabs.io/docs/llms.txt", accessed: 2026-10-23}
  - {title: Vapi pricing, url: "https://vapi.ai/pricing", accessed: 2026-10-23}
  - {title: "Vapi docs: MCP tools", url: "https://docs.vapi.ai/mcp", accessed: 2026-10-23}
last_verified: 2026-10-23
published: 2026-10-23
---

A voice agent is an ordinary tool-using agent with two hard extras: audio has to move in real time (WebRTC, WebSocket or a phone line), and the agent has to know when the person has stopped talking. The five options here split along two questions.

## Do you want a framework, a model API or a platform?

- **Frameworks you run:** [LiveKit Agents](entry:livekit-agents) and [Pipecat](entry:pipecat). Both are open source and vendor-neutral. You write Python, pick providers for each stage and deploy wherever you like. Each has an optional managed cloud (LiveKit Cloud, Pipecat Cloud by Daily).
- **A model API:** the [OpenAI Realtime API](entry:openai-realtime-api) is one speech-to-speech model you call over WebRTC or WebSocket. You still host the app, mint ephemeral keys and run your own tool backend. Both frameworks can also use it as their model.
- **Hosted platforms:** [ElevenAgents](entry:elevenagents) and [Vapi](entry:vapi). You configure an assistant in a dashboard or API, attach a phone number and pay per minute. Testing, analytics and telephony are built in.

## Cascaded pipeline or speech-to-speech?

A **cascaded** agent runs speech-to-text, then an LLM, then text-to-speech. You can pick the best vendor for each stage, read every transcript and use any text LLM, but each hop adds delay. A **speech-to-speech** model (OpenAI Realtime, Eleven Realtime, the realtime plugins in LiveKit and Pipecat) handles audio end to end, which removes the hand-offs between stages, but you are tied to that model's voices and pricing. LiveKit, Pipecat and ElevenAgents support both. Vapi's docs and pricing are built around a transcriber, a model and a voice (cascaded), and OpenAI Realtime voice sessions are speech-to-speech.

```mermaid
flowchart LR
  caller((Caller)) -- WebRTC / SIP --> T[Transport]
  T --> STT --> LLM --> TTS --> T
  T -. speech-to-speech .-> S2S[Realtime model] -.-> T
  LLM -- tool calls --> MCP[(MCP servers)]
  S2S -- tool calls --> MCP
```

## Tools: all five speak MCP

Every option can now call tools on a [Model Context Protocol](entry:model-context-protocol) server, but in different ways:

- **LiveKit** and **Pipecat** connect from your agent process. Pipecat's `MCPClient` turns a server's tools into a `ToolsSchema` for the LLM, with filters for which tools and outputs to expose.
- **OpenAI Realtime** connects for you when you add an `mcp` tool with a `server_url`. Use a `function` tool instead when your own code should run the action or check approvals.
- **Vapi** imports *every* tool the server exposes at the start of each call and opens a new MCP session for each tool call. Its docs warn that large tool lists add latency and timeout risk, so point it at a narrowly scoped server (for example a [Zapier MCP](entry:zapier-mcp) or [Composio](entry:composio) server limited to a few actions).
- **ElevenAgents** attaches MCP servers as agent tools and publishes a security page for third-party servers.

On a live call a slow tool means silence. Keep tool responses small and fast, and put long jobs behind a quick acknowledgement.

## Cost

Per-minute platform fees stack on top of model costs. As of 2026-10-23: Vapi charges $0.05/min hosting plus provider costs, ElevenAgents $0.08 per additional minute plus LLM and telephony at cost, Pipecat Cloud $0.01 per active agent minute (agent-1x) with providers billed separately, and LiveKit Cloud includes 1,000 agent session minutes free, then $0.01/min on paid plans. OpenAI Realtime bills by audio and text tokens, so idle open sessions and long system prompts cost money. OpenAI's cost guide recommends closing idle sessions. Check the pricing pages before you commit, because these numbers change often.

## Caveats

- Latency and accuracy numbers on vendor pages (time to first audio, turn-taking scores) are vendor claims. Measure them on your own calls.
- Voice adds new prompt-injection paths: a caller can say instructions out loud, and tool results get read back. The guide [Test an agent for prompt injection](guide:test-an-agent-for-prompt-injection) applies here too.
- Phone numbers, call recording and data retention bring legal duties (consent, HIPAA, data residency). The plans differ in retention and in zero-data-retention (ZDR) options.
