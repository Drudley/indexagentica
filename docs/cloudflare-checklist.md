# Cloudflare checklist (after the nameserver move)

For whoever moves `indexagentica.com` to Cloudflare (Free plan). It covers the site settings that affect
crawlers and agents. Deploying the MCP Worker is covered separately in
[indexagentica-mcp/DEPLOY.md](https://github.com/Drudley/indexagentica-mcp/blob/main/DEPLOY.md), and
measurement in `metrics/measurement-plan.md` (Steward).
Claims were checked on 2026-10-02. Links point at the sources.

## 0. DNS and TLS (do this first)

- [ ] Import or recreate the GitHub Pages records exactly (see README "Custom domain"): apex `A`
      185.199.108.153 / .109 / .110 / .111, apex `AAAA` 2606:50c0:8000::153 … 8003::153, `www` `CNAME`
      drudley.github.io. Keep any other records the scan finds.
- [ ] Leave the records **DNS only (grey cloud)** until GitHub Settings → Pages shows the certificate as valid
      and **Enforce HTTPS** is still on. Then proxy apex and `www`.
- [ ] SSL/TLS mode **Full (strict)**, never **Flexible**: GitHub's HTTPS redirect plus Flexible causes a
      redirect loop ([docs](https://developers.cloudflare.com/ssl/troubleshooting/too-many-redirects/)).
      Known risk: GitHub's Let's Encrypt renewal can fail behind the proxy, and the current origin cert
      expires 2026-12-31. See measurement-plan.md §6 for the workarounds, and probe the origin cert with
      `openssl s_client -connect 185.199.108.153:443 -servername indexagentica.com </dev/null | openssl x509 -noout -enddate`.

## 1. AI crawl controls: Search = Allow, Training = Allow, Agent = Allow

- [ ] Security → Settings → **Configure AI bot policies**: set all three (Search, Training, Agent) to
      **Allow (do not block)**. Don't use "Block on pages with ads": the site has no ads, and agents
      are the audience.
- Why: on 2026-09-15 Cloudflare replaced "Block AI Bots" with these three controls. New non-ad sites are
  offered "all allowed" as the recommendation, but ad-carrying sites get Training/Agent blocked, and it is
  a *proposed* default. Confirm what's actually set.
  Sources: [press release 2026-09-15](https://www.cloudflare.com/press/press-releases/2026/cloudflare-helps-end-the-search-or-ai-training-tradeoff/),
  [Block AI Bots docs](https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/).
- [ ] AI Crawl Control (all plans): leave every crawler on Allow. Use it to watch per-crawler traffic.

## 2. Bot Fight Mode: OFF

- [ ] Security → Bots → **Bot Fight Mode: Off**.
- Why: on Free it "cannot be bypassed or skipped using WAF custom rules or Page Rules"
  ([docs](https://developers.cloudflare.com/bots/get-started/bot-fight-mode/)). Smithery documents that it
  blocks its scanner `SmitheryBot/1.0` and tells you to disable it
  ([Smithery](https://smithery.ai/docs/build/publish)). It would also challenge agent fetchers (curl,
  HTTP clients), and they are the audience. Super Bot Fight Mode (Pro) is the variant that supports skip rules.
- [ ] Leave "Block AI bots" (legacy) off, and don't add WAF rules that challenge non-browser user agents.

## 3. Managed robots.txt / Bot Preference Sync: OFF

- [ ] Security → Settings → bot traffic: **"Set your preference to block training in robots.txt" off**,
      and **Bot Preference Sync** (its 2026-09-15 replacement) off, or set to allow everything.
- Why: when on, Cloudflare **prepends** its own block (e.g. `Content-signal: … ai-train=no` and
  `Disallow: /` for GPTBot, ClaudeBot, CCBot, Google-Extended …) to our robots.txt
  ([docs](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/)).
  That contradicts our policy. The robots.txt we serve must stay the repo version (built by
  `scripts/build.mjs`), which allows every listed bot including SmitheryBot.
- Note: Free zones *without* their own robots.txt get a Content Signals Policy preamble. We have one, so
  that shouldn't apply. Check anyway in step 4.

## 4. Verify after the move (and after any settings change)

```sh
for ua in 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.1; +https://openai.com/gptbot' \
          'ClaudeBot/1.0; +claudebot@anthropic.com' 'SmitheryBot/1.0 (+https://smithery.ai)' 'curl/8.5.0'; do
  for p in /robots.txt /llms.txt /api/index.json /sitemap.xml /.well-known/mcp-registry-auth; do
    printf '%-4s %-32s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' -A "$ua" "https://indexagentica.com$p")" "$p" "$(echo "$ua" | grep -o '[A-Za-z]*Bot/[0-9.]*\|curl/[0-9.]*')"
  done
done
# robots.txt must be byte-identical to the build (no prepended Cloudflare block):
curl -s https://indexagentica.com/robots.txt | head -5        # starts with "# Index Agentica: built by agents, for agents."
curl -s https://indexagentica.com/robots.txt | grep -ci 'disallow\|content-signal'   # expect 0
curl -sI https://indexagentica.com/ | grep -i '^server\|^cf-ray'                     # confirms the proxy is active
```

- [ ] All 200s for every UA, with no 403 or challenge page (`cf-mitigated: challenge` header).
- [ ] robots.txt has no Cloudflare-managed section.
- [ ] `/.well-known/mcp-registry-auth` still returns `v=MCPv1; k=ed25519; p=…` (needed for MCP Registry
      HTTP auth).
- [ ] The IndexNow key file `https://indexagentica.com/<key>.txt` (see README) returns the key.

## 5. Measurement (per Steward's `metrics/measurement-plan.md`)

- [ ] **Logpush** `http_requests` → R2 (available on Free, 25 GB/month included). Fields: EdgeStartTimestamp,
      ClientRequestHost, ClientRequestURI, ClientRequestPath, ClientRequestUserAgent, ClientRequestReferer,
      EdgeResponseStatus, VerifiedBotCategory, ClientCountry. **Omit ClientIP** (GDPR minimisation).
- [ ] **Web Analytics** with auto-inject (proxied zone) for human page views. It is a JS beacon, so agents and
      crawlers are invisible to it, and it drops query strings (no UTMs). Logpush covers those.
- [ ] DNS analytics on, and check AI Crawl Control's per-crawler view after a week.
- [ ] The MCP Worker writes its own usage data to Workers Analytics Engine (dataset `indexagentica_mcp`; see
      the MCP repo README "Usage logging").

## 6. Search engines (Niklas)

- [ ] Google Search Console **Domain** property: add the TXT record in Cloudflare DNS, verify, submit
      `https://indexagentica.com/sitemap.xml`.
- [ ] Bing Webmaster Tools: import from GSC and submit the sitemap. The IndexNow submissions from
      `pages.yml` show up there.
