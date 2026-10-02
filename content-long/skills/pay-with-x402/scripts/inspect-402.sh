#!/usr/bin/env bash
# Show the x402 v2 price for a URL without paying.
# Usage: scripts/inspect-402.sh <url> [method]
# Needs curl, base64 and jq. Sends one unpaid request; nothing is signed.
set -euo pipefail
url="${1:?usage: inspect-402.sh <url> [method]}"
method="${2:-GET}"
case "$url" in https://*|http://*) ;; *) echo "error: URL must start with http:// or https://" >&2; exit 2;; esac

headers="$(curl -s -X "$method" -D - -o /dev/null "$url")"
status="$(printf '%s\n' "$headers" | head -n1 | awk '{print $2}')"
echo "HTTP status: $status"
pr="$(printf '%s\n' "$headers" | grep -i '^payment-required:' | head -n1 | cut -d' ' -f2- | tr -d '\r' || true)"
if [ -z "$pr" ]; then
  echo "No PAYMENT-REQUIRED header (not an x402 v2 endpoint, or no payment needed)." >&2
  exit 1
fi
printf '%s' "$pr" | base64 -d | jq '{
  x402Version, error, resource,
  options: [.accepts[] | {scheme, network, asset, payTo, maxTimeoutSeconds,
    amount_atomic: .amount,
    approx_usd_if_6_decimals: ((.amount | tonumber) / 1000000)}]
}'
