#!/usr/bin/env bash
# Probe a remote MCP endpoint: is it up, does it need OAuth, and where is its authorization server?
# Usage: probe.sh <mcp-endpoint-url>
# Sends one MCP initialize request with no credentials and reads the response. Changes nothing.
set -uo pipefail
url="${1:?usage: probe.sh <mcp-endpoint-url>}"
hdrs=$(mktemp); body=$(mktemp); trap 'rm -f "$hdrs" "$body"' EXIT
code=$(curl -sS -o "$body" -D "$hdrs" -w '%{http_code}' -X POST "$url" \
  -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' \
  -H 'mcp-protocol-version: 2025-06-18' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"pick-an-mcp-server-probe","version":"1.0"}}}')
echo "HTTP $code"
case "$code" in
  200)
    echo "Open: initialize succeeded without credentials."
    head -c 300 "$body"; echo ;;
  401)
    wa=$(grep -i '^www-authenticate:' "$hdrs" | tr -d '\r')
    echo "Auth required. $wa"
    prm=$(printf '%s' "$wa" | sed -n 's/.*resource_metadata="\([^"]*\)".*/\1/p')
    if [ -n "$prm" ]; then
      echo "Protected Resource Metadata ($prm):"
      curl -sS "$prm" | jq '{resource, authorization_servers, scopes_supported}' 2>/dev/null || curl -sS "$prm"
      echo "=> OAuth per the MCP authorization spec; the client will open a browser sign-in."
    else
      echo "=> No resource_metadata: probably an API key or a custom header. Read the server docs."
    fi ;;
  403) echo "Forbidden: may need an API key, an allow-list or a different region endpoint." ;;
  404|405) echo "Not an MCP Streamable HTTP endpoint at this path (or GET/POST mismatch). Check the URL." ;;
  000) echo "No response: DNS, TLS or network failure." ;;
  *) echo "Unexpected status. First bytes of body:"; head -c 300 "$body"; echo ;;
esac
