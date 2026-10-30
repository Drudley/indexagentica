---
id: self-host-a-code-execution-api
type: guide
title: Self-host a code-execution API for agents with Piston or Judge0
summary: "Run Piston or Judge0 on your own server to give an agent a stateless run_code tool for many languages: what each one isolates, the host requirements that decide between them, the limits to set, and a tested tool wrapper."
description: "Piston and Judge0 are open-source execute-and-return services built on the Isolate sandbox. They do not give an agent a machine with a filesystem; they run one program and return its output. This guide shows a tested Piston setup and a set of hostile probes with their real results, a stdlib Python run_code tool wrapper, Judge0's Docker Compose setup and what happened when we ran it on a cgroup v2 host, the 2024 Judge0 sandbox-escape CVEs, and the settings to change before you put either one in front of an agent."
author: Agentica Author
difficulty: intermediate
time_estimate: 45 min
prerequisites:
  - A Linux host where you can run privileged Docker containers
  - For Piston, cgroup v2 with cgroup v1 disabled; for Judge0 v1.13.1, cgroup v1 (see below)
  - Python 3.9+ for the tool wrapper
tags: [code-execution, sandboxes, self-hosted, security, agents, tools]
entries: [piston, judge0, llm-sandbox, e2b, microsandbox]
sources:
  - title: Piston README
    url: https://github.com/engineer-man/piston
    accessed: 2026-10-30
  - title: Piston docs, API v2
    url: https://github.com/engineer-man/piston/blob/master/docs/api-v2.md
    accessed: 2026-10-30
  - title: Piston docs, Configuration
    url: https://github.com/engineer-man/piston/blob/master/docs/configuration.md
    accessed: 2026-10-30
  - title: Piston source, api/src/config.js
    url: https://github.com/engineer-man/piston/blob/master/api/src/config.js
    accessed: 2026-10-30
  - title: Judge0 README
    url: https://github.com/judge0/judge0
    accessed: 2026-10-30
  - title: Judge0 v1.13.1 release notes
    url: https://github.com/judge0/judge0/releases/tag/v1.13.1
    accessed: 2026-10-30
  - title: Judge0 CE API docs
    url: https://ce.judge0.com/
    accessed: 2026-10-30
  - title: Judge0 TELEMETRY.md
    url: https://github.com/judge0/judge0/blob/master/TELEMETRY.md
    accessed: 2026-10-30
  - title: "GHSA-h9g2-45c8-89cf (CVE-2024-28185): Judge0 sandbox escape via symbolic link"
    url: https://github.com/judge0/judge0/security/advisories/GHSA-h9g2-45c8-89cf
    accessed: 2026-10-30
  - title: "GHSA-3xpw-36v7-2cmg (CVE-2024-28189): Judge0 patch bypass via chown on a symbolic link"
    url: https://github.com/judge0/judge0/security/advisories/GHSA-3xpw-36v7-2cmg
    accessed: 2026-10-30
  - title: "GHSA-q7vg-26pg-v5hr (CVE-2024-29021): Judge0 SSRF into sandbox escape"
    url: https://github.com/judge0/judge0/security/advisories/GHSA-q7vg-26pg-v5hr
    accessed: 2026-10-30
  - title: Isolate (ioi/isolate)
    url: https://github.com/ioi/isolate
    accessed: 2026-10-30
related: [run-untrusted-code-in-a-sandbox, code-sandboxes, self-hosted-agent-sandboxes, coding-agent-starter]
last_verified: 2026-10-30
published: 2026-10-30
---

## When an execute API is the right tool

Most sandbox products give an agent a disposable machine: a filesystem it can keep writing to, a shell, packages it can install, sometimes a browser. [Run agent-generated code safely in a sandbox](guide:run-untrusted-code-in-a-sandbox) and the comparisons of [hosted code sandboxes](comparison:code-sandboxes) and [self-hosted agent sandboxes](comparison:self-hosted-agent-sandboxes) cover that kind.

[Piston](entry:piston) and [Judge0](entry:judge0) are a different, smaller thing. They take source code plus stdin, run it once under fixed limits, and return stdout, stderr, the exit code and timing. Nothing survives between calls. They came out of chat bots and online judges, so they support many languages and are built to run code from strangers.

That shape fits an agent tool when you want:

- a **calculator-style tool** ("run this snippet and tell me what it prints") with no state to clean up,
- **many languages** behind one HTTP call, for example to check a code answer in the language the user asked about,
- **grading or testing** generated solutions against fixed inputs,
- something you can run **on your own server** with no per-second billing.

It is the wrong shape when the agent needs to install a package, keep files between steps, clone a repository or run a long job. Use a machine-style sandbox for that.

Both projects put the [Isolate](https://github.com/ioi/isolate) sandbox (the one written for programming olympiads) inside a privileged Docker container. Isolate uses Linux namespaces, a chroot, a separate unprivileged uid per run and cgroups for limits. That is a container-class boundary on a kernel shared with the host, not a VM. Run them on a host that does nothing else important.

## What was run for this guide

On 2026-10-30 we ran Piston (image `ghcr.io/engineer-man/piston`, built 2025-02-08) under Docker on a Linux 6.12 host with cgroup v2, installed Python 3.12.0, GCC 10.2.0, Bash 5.2.0 and Lua 5.4.4, and ran every probe and the wrapper below against it. The results quoted are from those runs.

We also brought up Judge0 CE v1.13.1 with its release Compose file on the same host. The API came up, but every submission failed with an internal error, because that release needs cgroup v1 (details below). So the Judge0 sections describe the API from its docs and its own `/config_info` output; we did not see a Judge0 submission succeed.

## Pick by host first

The deciding fact is often your kernel's cgroup setup, not features.

| | Piston | Judge0 CE v1.13.1 |
|---|---|---|
| License | MIT | GPL-3.0 |
| Host requirement | cgroup v2 enabled and cgroup v1 disabled | cgroup v1: the release notes tell you to add `systemd.unified_cgroup_hierarchy=0` to GRUB on Ubuntu 22.04 and reboot |
| Services | one container | four: API server, workers, PostgreSQL, Redis |
| Request model | synchronous `POST /api/v2/execute`; WebSocket for interactive runs | queued submissions; poll by token, use `wait=true`, or a callback URL |
| Languages | installed one by one as packages | fixed set in the image (47 in our CE v1.13.1 instance; Extra CE is a separate branch) |
| Auth | none | optional token header, off by default |
| Telemetry | none documented | on by default |
| Last release | rolling `master` image | v1.13.1, 2024-04-18 |

Most current distributions (Ubuntu 22.04 and later, Debian 12, Fedora) boot with cgroup v2 only. Check yours:

```bash
stat -fc %T /sys/fs/cgroup   # cgroup2fs means cgroup v2 only
```

On a cgroup v2 host, Piston runs as documented and Judge0 v1.13.1 needs a kernel command-line change and a reboot. On a dedicated cgroup v1 host, either works.

## Run Piston

Start the API, bound to localhost only. The README's command publishes port 2000 on every interface; do not do that on a machine with a public address, because the API has no authentication.

```bash
mkdir -p piston-data
docker run --privileged -v "$PWD/piston-data:/piston" -dit \
  -p 127.0.0.1:2000:2000 \
  -e PISTON_RUN_MEMORY_LIMIT=268435456 \
  --name piston_api ghcr.io/engineer-man/piston
```

`--privileged` is required: Isolate needs it to create namespaces and cgroups inside the container. That is one more reason to give Piston its own host or VM.

The image has no languages. List what can be installed, install what you need, and check what is ready:

```bash
curl -s localhost:2000/api/v2/packages     # every package, with "installed": true/false
curl -s -X POST localhost:2000/api/v2/packages \
  -H 'content-type: application/json' -d '{"language":"python","version":"3.12.0"}'
curl -s localhost:2000/api/v2/runtimes     # what /execute can use now
```

Installing Lua 5.4.4 took about 3 seconds here. The package endpoint is as unauthenticated as `/execute`, so anyone who can reach the API can install runtimes. Expose only `/api/v2/execute` to the agent (see the hardening list).

Run code:

```bash
curl -s -X POST localhost:2000/api/v2/execute -H 'content-type: application/json' -d '{
  "language": "python", "version": "3.12",
  "files": [{"name": "main.py", "content": "import helper; print(helper.X)"},
            {"name": "helper.py", "content": "X = 99"}],
  "stdin": ""
}'
```

```json
{"run":{"signal":null,"stdout":"99\n","stderr":"","code":0,"output":"99\n","memory":3856000,"message":null,"status":null,"cpu_time":11,"wall_time":51},"language":"python","version":"3.12.0"}
```

`version` is required and is a semver selector, so `"3.12"` matched 3.12.0. Leaving it out returns `400 {"message":"version is required as a string"}`. The first file is the one that runs. Compiled languages add a `compile` object with the same fields as `run`. `status` is null on success, or one of `RE` (runtime error), `SG` (signal), `TO` (timeout), `OL` (stdout too long), `EL` (stderr too long) or `XX` (internal error).

## What the sandbox actually stopped

We sent these snippets with default limits, except where noted:

| Probe | Result |
|---|---|
| `while True: pass` | `status: TO`, `SIGKILL`, "Time limit exceeded (wall clock)" at about 3.1 s |
| `time.sleep(10)` | `TO` at 3.1 s, so wall time is limited, not just CPU |
| TCP connect to `1.1.1.1:80` | `OSError: [Errno 101] Network is unreachable` |
| DNS lookup of `example.com` | `gaierror: [Errno -3] Temporary failure in name resolution` |
| Fork loop | stopped after 62 forks with `[Errno 11] Resource temporarily unavailable` |
| Allocate 512 MB with `run_memory_limit` 256 MiB | killed, exit code 137, `memory` 268432000 |
| Print 5,000 characters | `status: OL`, "stdout length exceeded", `SIGKILL` |
| Write to `/tmp` | allowed, as an unprivileged uid; the file was gone on the next run |
| List `/piston` | saw `['packages']`; writing to `/piston/packages` raised `PermissionError` |
| C program with a compile error | `compile.status: RE`, exit code 1; the run stage never started |
| `"language": "cobol"` | `400`, "cobol-* runtime is unknown" |

The defaults behind those numbers come from `api/src/config.js` and the configuration docs: networking disabled, 3 s run timeout and 3 s run CPU time, 10 s for compiling, 1,024 characters of output per stream, 64 processes, 2,048 open files, 10 MB maximum file size, and 64 concurrent jobs. The fork result (62 children plus the parent) matches the 64-process default. The README's security section still says processes are capped at 256 by default; the code and the configuration page say 64.

**The memory default is "no limit".** `compile_memory_limit` and `run_memory_limit` default to `-1`. Set them with `PISTON_RUN_MEMORY_LIMIT` and `PISTON_COMPILE_MEMORY_LIMIT` (bytes). With no server limit, a request could ask for `run_memory_limit: 999999999999` and Piston ran it. With `PISTON_RUN_MEMORY_LIMIT=268435456` set, the same request got `400 {"message":"run_memory_limit cannot exceed the configured limit of 268435456"}`, and a 512 MB allocation was killed even when the request did not mention memory.

Per-request limits can only go down. Asking for `run_timeout: 60000` against the default returned `400 {"message":"run_timeout cannot exceed the configured limit of 3000"}`. To allow more, raise the server value (for example `PISTON_RUN_TIMEOUT=10000`; a 5 s sleep then completed), or use `PISTON_LIMIT_OVERRIDES` to raise limits for one language only.

The 1,024-character output cap is small for an agent that wants to read a traceback. `PISTON_OUTPUT_MAX_SIZE=65536` let a 5,000-character print through. Truncate again in your wrapper so a chatty program does not fill the model's context.

The probe script, so you can rerun this against your own instance:

```bash
#!/usr/bin/env bash
# piston-probe.sh: run hostile and normal snippets against a Piston API and print one line each.
P=${PISTON_URL:-http://127.0.0.1:2000}
run() { # $1 label, $2 JSON body
  printf '%-11s ' "$1"
  curl -s -X POST "$P/api/v2/execute" -H 'content-type: application/json' -d "$2" |
    python3 -c 'import sys,json; d=json.load(sys.stdin); r=d.get("run",d); c=d.get("compile") or {}
print(json.dumps({"compile":c.get("status"),"status":r.get("status"),"code":r.get("code"),"signal":r.get("signal"),"stdout":(r.get("stdout") or "")[:70],"stderr":(r.get("stderr") or "")[-90:],"message":r.get("message"),"wall_ms":r.get("wall_time"),"mem":r.get("memory")}))'
}
py() { python3 -c 'import json,sys; print(json.dumps({"language":"python","version":"3.12","files":[{"content":sys.argv[1]}],**json.loads(sys.argv[2] if len(sys.argv)>2 else "{}")}))' "$@"; }

run hello     "$(py 'print("hello from piston")')"
run timeout   "$(py 'while True: pass')"
run sleep     "$(py 'import time; time.sleep(10)')"
run network   "$(py 'import socket; socket.create_connection(("1.1.1.1",80),timeout=3); print("NET OK")')"
run dns       "$(py 'import socket; print(socket.gethostbyname("example.com"))')"
run forkbomb  "$(py 'import os
n=0
try:
    while True:
        if os.fork()==0:
            import time; time.sleep(5); os._exit(0)
        n+=1
except OSError as e: print("forks before error:",n,e)')"
run memory    "$(py 'b=bytearray(512*1024*1024); print("allocated", len(b))' '{"run_memory_limit":268435456}')"
run bigout    "$(py 'print("x"*5000)')"
run write-tmp "$(py 'open("/tmp/x","w").write("1"); import os; print(os.getuid(), os.listdir("/tmp"))')"
run read-host "$(py 'import os; print(os.listdir("/piston"))')"
run unknown   '{"language":"cobol","version":"*","files":[{"content":"x"}]}'
```

## Wrap it as an agent tool

The model should see one small tool with a fixed language list. The wrapper re-checks limits so the model cannot ask for more, and returns a compact result. This is standard-library Python and was run against the instance above; the schema is in the shape most function-calling APIs accept (rename `input_schema` to `parameters` where needed).

```python
import json, os, urllib.request, urllib.error

PISTON_URL = os.environ.get("PISTON_URL", "http://127.0.0.1:2000")
ALLOWED = {"python": "3.12", "bash": "5", "c": "10"}  # language -> version selector
MAX_CODE_BYTES = 64_000
MAX_RETURN_CHARS = 4_000

TOOL_SCHEMA = {
    "name": "run_code",
    "description": "Run a short, self-contained program and return its output. "
                   "No network, no persistent files, about 3 s of run time.",
    "input_schema": {
        "type": "object",
        "properties": {
            "language": {"type": "string", "enum": sorted(ALLOWED)},
            "code": {"type": "string"},
            "stdin": {"type": "string"},
        },
        "required": ["language", "code"],
    },
}

def _post(path, body, timeout=30):
    req = urllib.request.Request(PISTON_URL + path, data=json.dumps(body).encode(),
                                 headers={"content-type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        return {"message": json.load(e).get("message", str(e))}

def run_code(language, code, stdin=""):
    if language not in ALLOWED:
        return {"ok": False, "error": f"language must be one of {sorted(ALLOWED)}"}
    if len(code.encode()) > MAX_CODE_BYTES:
        return {"ok": False, "error": "code too large"}
    res = _post("/api/v2/execute", {
        "language": language, "version": ALLOWED[language],
        "files": [{"content": code}], "stdin": stdin or "",
        "run_timeout": 3000, "run_memory_limit": 256 * 1024 * 1024,
    })
    if "run" not in res:   # 400: bad request, unknown runtime, limit above the server's
        return {"ok": False, "error": res.get("message", "execution failed")}
    stage = res.get("compile") if res.get("compile", {}).get("code") else res["run"]
    return {
        "ok": stage["code"] == 0 and stage["status"] is None,
        "stage": "compile" if stage is not res["run"] else "run",
        "exit_code": stage["code"], "signal": stage["signal"],
        "status": stage["status"], "message": stage["message"],
        "stdout": stage["stdout"][:MAX_RETURN_CHARS],
        "stderr": stage["stderr"][:MAX_RETURN_CHARS],
    }
```

What it returned for six test calls:

| Call | Result |
|---|---|
| Python `print(sum(range(10)))` | `ok: true`, stdout `45` |
| Python reading stdin `hi` | `ok: true`, stdout `HI` |
| C with an undeclared variable | `ok: false`, `stage: compile`, `status: RE`, compiler error in stderr |
| Python `while True: pass` | `ok: false`, `status: TO`, "Time limit exceeded (wall clock)" |
| Python `urlopen("http://1.1.1.1")` | `ok: false`, `status: RE`, "Network is unreachable" in stderr |
| `language: "ruby"` | rejected by the wrapper before any request |

Two habits matter more than the code. Treat `stdout` and `stderr` as data the model reads, never as instructions to follow. And because Piston blocks the network, tell the model so in the tool description; otherwise it will try `pip install` and waste turns.

If you would rather call a library than run a service, [LLM Sandbox](entry:llm-sandbox) runs code through Docker, Kubernetes, Podman, Bubblewrap or NsJail backends from Python and ships an MCP server.

## Run Judge0

Judge0's release deployment, from the v1.13.1 release notes:

```bash
wget https://github.com/judge0/judge0/releases/download/v1.13.1/judge0-v1.13.1.zip
unzip judge0-v1.13.1.zip && cd judge0-v1.13.1
# set REDIS_PASSWORD and POSTGRES_PASSWORD in judge0.conf to long random values
docker-compose up -d db redis
sleep 10s
docker-compose up -d
```

The Compose file runs four services. `server` and `workers` both use `judge0/judge0:1.13.1` with `privileged: true`, and the server publishes `2358:2358` on all interfaces. Change that to `127.0.0.1:2358:2358` unless a gateway sits in front.

Submit code and wait for the result in one call (`language_id` 71 is Python 3.8.1 in CE):

```bash
curl -s -X POST 'localhost:2358/submissions?base64_encoded=false&wait=true' \
  -H 'content-type: application/json' \
  -d '{"source_code":"print(\"hello\")","language_id":71,"stdin":""}'
```

Without `wait=true` you get a token back and poll `GET /submissions/{token}`. `POST /submissions/batch` takes up to 20 at once by default, and a `callback_url` field makes Judge0 call you when a run finishes. `GET /languages` lists ids, and `GET /statuses` returns the result codes, from 1 "In Queue" and 3 "Accepted" to 5 "Time Limit Exceeded", 6 "Compilation Error", 7 to 12 for runtime errors and 13 "Internal Error". `GET /config_info` shows the limits in force. The interactive docs are served at `/docs` on your instance and at ce.judge0.com.

### What happened on a cgroup v2 host

The API came up and answered `/about`, `/languages` (47 languages), `/statuses` and `/config_info`. Every submission came back as status 13, Internal Error, with the message `No such file or directory @ rb_sysopen - /box/script.py`. Running Isolate's setup by hand inside the workers container shows why:

```text
$ isolate --version
The process isolator 1.8.1
$ isolate --cg -b 99 --init
Failed to create control group /sys/fs/cgroup/memory/box-99/: No such file or directory
```

Isolate 1.8.1, bundled in the v1.13.1 image, expects the cgroup v1 memory controller at `/sys/fs/cgroup/memory`. On a cgroup v2 host that path does not exist, so the sandbox is never created. This is what the release notes' GRUB step is for. If you cannot change the host's boot parameters (most managed Kubernetes nodes and many cloud images), use Piston or a different sandbox, or give Judge0 a VM you control.

(Unrelated to Judge0: on our host the Compose network's DNS and container-to-container traffic did not work, so to get this far we put all four services in one network namespace. Do not copy that workaround. It puts PostgreSQL and Redis on the same localhost as the workers, which is exactly what a sandboxed program with networking enabled must not reach.)

### Judge0 settings to change

The live `/config_info` of the default install showed these, and `judge0.conf` documents each:

- **Authentication is off.** `AUTHN_TOKEN` is empty by default. Set it, and clients send it in the `X-Auth-Token` header (`AUTHN_HEADER` renames it). `AUTHZ_TOKEN` (header `X-Auth-User`) is a separate token for protected API calls, which are disabled while it is empty.
- **Callers can turn networking on.** `enable_network` defaults to false, but `allow_enable_network` defaults to true, so any client can send `"enable_network": true` with a submission. Set `ALLOW_ENABLE_NETWORK=false`.
- **Telemetry is on.** Per TELEMETRY.md, every instance sends its instance ID and version to Judge0's server every 12 hours. Set `JUDGE0_TELEMETRY_ENABLE=false` if you don't want that.
- **Defaults to know:** 5 s CPU time (15 s max), 10 s wall time (20 s max), 128 MB memory (512 MB max), 60 processes, 1 MB per file the program writes, a queue of 100, and `wait=true` allowed. Clients can raise limits up to the `MAX_*` values, so set the `MAX_*` values to what you would accept.

### The 2024 sandbox escapes

v1.13.1 fixed three critical advisories reported by Daniel Cooper, all affecting versions up to 1.13.0:

- **CVE-2024-28185:** symlinks placed inside the sandbox directory let a submission write files outside it and run code on the host.
- **CVE-2024-28189:** a bypass of that fix, through `chown` following a symlink.
- **CVE-2024-29021:** with `enable_network`, a submission could reach the PostgreSQL database on the internal Docker network and turn that into unsandboxed code execution as root.

The lesson goes beyond Judge0. In both projects the API and the code it runs sit in the same privileged container, so the boundary is Isolate plus your settings. Run v1.13.1 or later, keep networking off, and put the whole stack on a host with nothing worth stealing.

## Hardening checklist for either one

1. **Give it its own VM or host.** Both need privileged containers, and Isolate shares the host kernel. That VM is your real boundary.
2. **Bind to localhost or a private network**, and put a small gateway in front that allows only the execute endpoint (`POST /api/v2/execute`, or `POST /submissions`) and checks a token. Piston has no auth at all, and its package endpoint installs runtimes for anyone.
3. **Keep networking off.** It is off by default in Piston (`PISTON_DISABLE_NETWORKING=true`). In Judge0, set `ALLOW_ENABLE_NETWORK=false` so callers cannot turn it on.
4. **Set server-side ceilings.** Piston: set `PISTON_RUN_MEMORY_LIMIT` and `PISTON_COMPILE_MEMORY_LIMIT`, which default to unlimited. Judge0: set the `MAX_*` values. Then set tighter per-call values in the wrapper.
5. **Install only the languages the agent needs.** It is less to patch and less for the model to try.
6. **Rate-limit the tool.** Piston runs up to 64 jobs at once by default (`PISTON_MAX_CONCURRENT_JOBS`); Judge0 rejects submissions once 100 are queued. An agent stuck in a loop can fill either.
7. **Treat output as untrusted** and truncate it before it goes back into the model's context.
8. **Don't rely on the public Piston API.** Since 15 Feb 2026 the emkc.org instance needs a key from the maintainer, issued only for non-commercial educational projects. Judge0's hosted option is Judge0 Cloud, through Rapid or directly.

When the agent outgrows one-shot runs and needs a persistent workspace, move to a machine-style sandbox: [E2B](entry:e2b) or the others in [hosted code sandboxes](comparison:code-sandboxes), or [microsandbox](entry:microsandbox) and the others in [self-hosted agent sandboxes](comparison:self-hosted-agent-sandboxes).
