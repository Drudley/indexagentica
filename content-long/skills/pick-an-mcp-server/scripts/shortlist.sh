#!/usr/bin/env bash
# Shortlist MCP servers from Index Agentica for a need, with auth, license and freshness.
# Usage: shortlist.sh "<keywords>" [limit]
# Needs curl and jq. No API key. Data: https://mcp.indexagentica.com (REST mirror of indexagentica.com).
set -euo pipefail
q="${1:?usage: shortlist.sh \"<keywords>\" [limit]}"
limit="${2:-10}"
base="https://mcp.indexagentica.com"
ids=$(curl -fsS -G "$base/search" --data-urlencode "q=$q" --data-urlencode "category=mcp-servers" \
        --data-urlencode "limit=$limit" | jq -r '.results[].id')
if [ -z "$ids" ]; then
  echo "No mcp-servers entries match \"$q\". Try broader keywords, or search all categories:" >&2
  echo "  curl -s -G '$base/search' --data-urlencode 'q=$q' | jq -r '.results[] | \"\(.category)\t\(.id)\"'" >&2
  exit 1
fi
printf 'id\tstatus\tremote_endpoint\tauth\tlicense\tmaintainer\tlast_verified\n'
for id in $ids; do
  curl -fsS "$base/entries/$id" | jq -r '[.id, .status, (.agent_access.mcp_endpoint // "local/none"),
     (.agent_access.auth // "?"), (.license // "?"), (.maintainer // "?"), .last_verified] | @tsv'
done
