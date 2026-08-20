# wizyty.jrobertgardzinski.pl — first-party visit-count proxy

Serves the per-post visit count to the blog from a subdomain of the blog
itself. Ad blockers and mobile tracking protection block requests to
`goatcounter.com` (EasyPrivacy: `||goatcounter.com^$third-party`), so the
page asks this proxy instead — first-party requests match no such rule.
The proxy reads GoatCounter's authenticated API, which is near-real-time,
unlike the public counter endpoint (cached ~4 h).

`GET /wpisy/pl/hello-world/` → `{"count": "3"}` (404 when the count is 0 —
same contract as GoatCounter's public counter endpoint). Internally it reads
`/api/v0/stats/total`, which aggregates across both trailing-slash spellings
of the path in one call.

## One-time setup

1. **GoatCounter API token** — on goatcounter.com: user menu → API →
   new token with the "read statistics" permission. Sanity-check it with
   these two single-line commands (multi-line commands with `\` are easy
   to break when copied — a truncated URL shows GoatCounter's HTML 404):

   ```sh
   curl -H "Authorization: Bearer $TOKEN" "https://jrobertgardzinski.goatcounter.com/api/v0/me"
   ```

   Expect a JSON blob with your user — that alone proves the token works.

   ```sh
   curl -H "Authorization: Bearer $TOKEN" "https://jrobertgardzinski.goatcounter.com/api/v0/stats/total?start=2024-01-01T00:00:00Z&path_by_name=true&include_paths=/wpisy/pl/hello-world/"
   ```

   Expect JSON whose `total` field is the visit count the proxy will serve.

2. **Deno Deploy** (free tier) — new project → link this GitHub repo →
   entrypoint `proxy/main.ts`. Env vars:

   | name | value |
   |---|---|
   | `GOATCOUNTER_TOKEN` | the token from step 1 (required) |
   | `GOATCOUNTER_CODE`  | defaults to `jrobertgardzinski` |
   | `ALLOWED_ORIGIN`    | defaults to `https://jrobertgardzinski.pl` |

3. **Custom domain** — in the Deno Deploy project add
   `wizyty.jrobertgardzinski.pl`; it shows a CNAME target. In the OVH DNS
   zone for `jrobertgardzinski.pl` add that CNAME record. Certificates are
   provisioned automatically.

4. Done — the blog already points at the proxy (`SITE.viewsProxy` in
   `src/config.ts`). Until the domain resolves, the page silently falls back
   to querying goatcounter.com directly, exactly as before.

Naming note: keep the subdomain and paths free of `count`, `counter`,
`stats`, `track`, `analytics` — EasyPrivacy carries *generic* rules
(`.com/count?`, `/api/stat?`, `/_visitcount?`) that match even first-party
URLs. "wizyty" matches nothing.

The handler is a web-standard `Request → Response` function; only the final
`Deno.serve(handler)` line is Deno-specific, so it ports to Vercel Edge,
Netlify Functions v2 or a Cloudflare Worker with a one-line entry change.
