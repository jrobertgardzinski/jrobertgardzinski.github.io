import type { Lang } from './posts';
import { SITE } from '../config';
import { formerPathsOf } from './renames.js';

// Reader-facing visit counts from GoatCounter's public counts endpoint
// (needs "Allow adding visitor counts to your website" in site settings).
//
// The number is fetched HERE, on the build machine, and baked into the HTML.
// It used to be fetched by the browser instead, and that is why the counter was
// missing on phones: goatcounter.com sits on the standard tracker blocklists
// (EasyPrivacy carries `||goatcounter.com^$third-party`), and the mobile
// browsers that ship with blocking switched on by default — Brave, Firefox with
// Enhanced Tracking Protection, Samsung Internet, DuckDuckGo, Safari with any
// content blocker — kill the request before it leaves the device. Desktop
// Chrome without an extension lets it through, which is why the counter looked
// fine there. A build-time fetch is same-origin as far as the reader is
// concerned: it is already part of the HTML, so no blocklist can touch it.
//
// The page still refreshes the number from the browser when it can — that keeps
// counts moving between deploys for readers who are not blocking anything.
//
// The build asks the same sources the page does, in the same order: the
// first-party proxy first (proxy/README.md — the authenticated API, no cache),
// then goatcounter.com's public counter endpoint. The public endpoint is not
// just cached, it also lags behind the API by whole visits (2026-09-06: the
// English posts had 1 visit each in the API and 404 on the public endpoint),
// and a lagging build bakes in nothing at all — the counter is then missing for
// every reader whose browser cannot reach the proxy.

/** Intl.PluralRules categories: "1 wizyta", "3 wizyty", "5 wizyt". */
export const VIEW_FORMS: Record<Lang, Record<string, string>> = {
  pl: { one: 'wizyta', few: 'wizyty', many: 'wizyt', other: 'wizyt' },
  en: { one: 'visit', other: 'visits' },
};

/** Keep in sync with the inline refresh script on the post page. */
export function formatViews(n: number, lang: Lang): string {
  const forms = VIEW_FORMS[lang];
  return `${n.toLocaleString(lang)} ${forms[new Intl.PluralRules(lang).select(n)] ?? forms.other}`;
}

// both overridable so the BDD fixture build can point at a local stub instead of
// the real services — same trick as POSTS_DIR in src/content.config.ts
const countsOrigin = () =>
  process.env.GOATCOUNTER_COUNTS_ORIGIN ??
  (SITE.goatcounterCode ? `https://${SITE.goatcounterCode}.goatcounter.com` : null);
const proxyOrigin = () => process.env.VIEWS_PROXY_ORIGIN ?? (SITE.viewsProxy || null);

// one build touches every post once, but `astro dev` re-runs this per request
const cache = new Map<string, number | null>();

// The proxy answers every uncached path with one call to GoatCounter's
// authenticated API, which allows 4 requests per second and answers a burst
// with 429 — which the proxy passes on as 502. A build asks about every post
// back to back, so without pacing a handful of posts in the middle of the run
// simply lose their number (2026-09-06: 2 of 17 pages, different ones each
// build). 300 ms apart stays at ~3 req/s; a one-off 5xx gets one more try
// after a pause, because the limiter forgets a burst within a second.
const PACE_MS = 300;
const RETRY_AFTER_MS = 1500;
let lastStart = 0;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
async function paced<T>(work: () => Promise<T>): Promise<T> {
  const wait = lastStart + PACE_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastStart = Date.now();
  return work();
}

/** The number one counts URL answers with, 0 for a 404 or anything unusable. */
async function countAt(url: string, retry = true): Promise<number> {
  const res = await paced(() => fetch(url, { signal: AbortSignal.timeout(5000) }));
  if (res.status >= 500 && retry) {
    console.info(`[views] ${res.status} from ${url} — retrying once in ${RETRY_AFTER_MS} ms`);
    await sleep(RETRY_AFTER_MS);
    return countAt(url, false);
  }
  if (!res.ok) return 0;
  // count_unique is documented as identical to count and kept only for
  // backwards compatibility — "should not be used for new code"
  return Number(String((await res.json()).count).replace(/\D/g, ''));
}

/**
 * Visits stored under exactly one page path, 0 when no source has any.
 *
 * The urls asked here are spellings of ONE path, so the first number wins —
 * summing them would count the same visits twice. The proxy answers for both
 * trailing-slash spellings at once; the public endpoint has to be asked twice,
 * because GoatCounter may hold the path with or without its trailing slash.
 */
async function countForPath(path: string): Promise<number> {
  const urls: string[] = [];
  const proxy = proxyOrigin();
  if (proxy) urls.push(`${proxy}${path}`);
  const origin = countsOrigin();
  if (origin) {
    const spellings = path.endsWith('/') && path !== '/' ? [path, path.slice(0, -1)] : [path];
    // the endpoint is /counter/ + the path *including* its leading slash,
    // so a real URL carries a double slash: /counter//wpisy/pl/slug/.json
    urls.push(...spellings.map((p) => `${origin}/counter/${p}.json`));
  }
  for (const url of urls) {
    try {
      const n = await countAt(url);
      if (n) return n;
    } catch (err) {
      // a dead host must not stall the build; the next source may still answer
      console.info(`[views] ${url}: ${err} — trying the next source`);
    }
  }
  return 0;
}

/**
 * Visits for a page path, or null when there is no number to show.
 *
 * A renamed post is counted under every address it ever had (src/lib/renames.js):
 * GoatCounter keys visits by path, so the visits from before a rename sit under
 * the old path forever and only summing brings them back.
 *
 * Null covers every failure the same way — endpoint disabled, page not visited
 * yet, build machine offline — because they all mean the same thing to the
 * reader: no counter on the meta line, rather than a broken one. A build must
 * never fail over analytics, so nothing here throws.
 */
export async function fetchViewCount(path: string): Promise<number | null> {
  if (!proxyOrigin() && !countsOrigin()) return null;
  if (cache.has(path)) return cache.get(path)!;

  let total = 0;
  for (const p of [path, ...formerPathsOf(path)]) total += await countForPath(p);
  const count = total || null;
  cache.set(path, count);
  return count;
}
