import type { Lang } from './posts';
import { SITE } from '../config';

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

// overridable so the BDD fixture build can point at a local stub instead of the
// real service — same trick as POSTS_DIR in src/content.config.ts
const countsOrigin = () =>
  process.env.GOATCOUNTER_COUNTS_ORIGIN ??
  (SITE.goatcounterCode ? `https://${SITE.goatcounterCode}.goatcounter.com` : null);

// one build touches every post once, but `astro dev` re-runs this per request
const cache = new Map<string, number | null>();

/**
 * Visits for a page path, or null when there is no number to show.
 *
 * Null covers every failure the same way — endpoint disabled, page not visited
 * yet, build machine offline — because they all mean the same thing to the
 * reader: no counter on the meta line, rather than a broken one. A build must
 * never fail over analytics, so nothing here throws.
 */
export async function fetchViewCount(path: string): Promise<number | null> {
  const origin = countsOrigin();
  if (!origin) return null;
  if (cache.has(path)) return cache.get(path)!;

  // GoatCounter may hold the path with or without its trailing slash
  const paths = path.endsWith('/') && path !== '/' ? [path, path.slice(0, -1)] : [path];
  let count: number | null = null;
  for (const p of paths) {
    // the endpoint is /counter/ + the path *including* its leading slash,
    // so a real URL carries a double slash: /counter//wpisy/pl/slug/.json
    try {
      const res = await fetch(`${origin}/counter/${p}.json`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      // count_unique is documented as identical to count and kept only for
      // backwards compatibility — "should not be used for new code"
      const n = Number(String((await res.json()).count).replace(/\D/g, ''));
      if (n) {
        count = n;
        break;
      }
    } catch (err) {
      console.info(`[views] ${p}: ${err} — building without a visit counter for this page`);
      break;
    }
  }
  cache.set(path, count);
  return count;
}
