// First-party visit-count proxy: wizyty.jrobertgardzinski.pl
//
// The blog page cannot ask goatcounter.com for its visit count from the
// browser — the domain sits on the standard tracker blocklists (EasyPrivacy:
// `||goatcounter.com^$third-party`), so browsers that block by default kill
// the request. This proxy lives on a subdomain of the blog itself: the same
// registrable domain means no `$third-party` rule can ever match, and the
// path deliberately avoids words the generic rules grep for (count, counter,
// stats, track — EasyPrivacy has first-party rules like `.com/count?`).
//
// It answers GET <blog path> (e.g. /wpisy/pl/hello-world/) with the same JSON
// shape as GoatCounter's public counter endpoint: {"count": "3"} — so the
// blog script treats both sources identically. Unlike that endpoint, which
// caches for four hours, this one reads the authenticated GoatCounter API
// (near-real-time) and keeps only a 60-second micro-cache, staying far under
// the API's 4 req/s limit.
//
// Deploy: Deno Deploy, entrypoint proxy/main.ts — see proxy/README.md.
// The handler is web-standard (Request -> Response), so it ports to any
// runtime with a fetch-shaped API if Deno Deploy ever stops fitting.

const CODE = Deno.env.get("GOATCOUNTER_CODE") ?? "jrobertgardzinski";
// API token from GoatCounter: user menu -> API -> new token with the
// "read statistics" permission. Set as a Deno Deploy env var, never commit.
const TOKEN = Deno.env.get("GOATCOUNTER_TOKEN") ?? "";
// Browsers enforce CORS even between same-site origins, so the blog origins
// must be allowed explicitly. localhost is for `astro dev`.
const ORIGINS = new Set([
  Deno.env.get("ALLOWED_ORIGIN") ?? "https://jrobertgardzinski.pl",
  "http://localhost:4321",
]);
// Predates the blog, so "since this date" means "since forever". Kept
// explicit because the API defaults `start` to one week ago.
const SINCE = "2024-01-01T00:00:00Z";
const CACHE_MS = 60_000;

const cache = new Map<string, { count: number; at: number }>();

function cors(origin: string | null): HeadersInit {
  const allowed = origin && ORIGINS.has(origin) ? origin : "https://jrobertgardzinski.pl";
  return {
    "content-type": "application/json",
    "access-control-allow-origin": allowed,
    "vary": "Origin",
    "cache-control": `public, max-age=${CACHE_MS / 1000}`,
  };
}

/** All-time visits for a blog path, from the authenticated GoatCounter API. */
async function fetchCount(path: string): Promise<number> {
  // stats/total aggregates server-side across include_paths, so both
  // trailing-slash spellings of the path are covered in one number — a visit
  // is stored under exactly one of them, whichever GoatCounter recorded
  const qs = new URLSearchParams({
    start: SINCE,
    path_by_name: "true", // include_paths by name, not by numeric path ID
  });
  qs.append("include_paths", path);
  if (path.endsWith("/") && path !== "/") qs.append("include_paths", path.slice(0, -1));

  const res = await fetch(`https://${CODE}.goatcounter.com/api/v0/stats/total?${qs}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`GoatCounter API: ${res.status} ${await res.text()}`);
  // "Total number of visitors (including events)" — the blog registers no events
  const { total } = await res.json();
  return total ?? 0;
}

async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get("origin");
  const headers = cors(origin);
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { ...headers, "access-control-allow-methods": "GET" } });
  }
  if (req.method !== "GET") return new Response(null, { status: 405, headers });

  const path = decodeURIComponent(new URL(req.url).pathname);
  // only blog-shaped paths — this is not an open proxy into the stats API
  if (!/^\/[a-z0-9\-/]{1,128}$/i.test(path)) {
    return new Response(JSON.stringify({ error: "bad path" }), { status: 404, headers });
  }

  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < CACHE_MS) {
    return respond(hit.count, headers);
  }
  try {
    const count = await fetchCount(path);
    cache.set(path, { count, at: Date.now() });
    return respond(count, headers);
  } catch (err) {
    console.error(`[wizyty] ${path}: ${err}`);
    // a stale number beats an error while GoatCounter hiccups
    if (hit) return respond(hit.count, headers);
    return new Response(JSON.stringify({ error: "upstream" }), { status: 502, headers });
  }
}

function respond(count: number, headers: HeadersInit): Response {
  // same shape and same zero-means-404 behaviour as GoatCounter's public
  // counter endpoint, so the blog script needs no source-specific handling
  const body = JSON.stringify({ count: String(count) });
  return new Response(body, { status: count > 0 ? 200 : 404, headers });
}

Deno.serve(handler);
