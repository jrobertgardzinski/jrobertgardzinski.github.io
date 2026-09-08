// The language a first-time visitor gets, before they touch the PL|EN switch.
// English, because the link travels further than Polish does: a reader from
// abroad should land on something they can read, a Polish one can flip it.
// Shared by the build (what the HTML says before JS runs) and the browser
// (site.js, what the switch falls back to without a saved choice).
export const DEFAULT_LANG = 'en';

// Shared by the build (Astro) and the browser (home.js): the post counter
// needs real Polish plural rules — 1 wpis / 2-4 wpisy / 5+ wpisów
// (with the 12-14 exception), English keeps it simple.
export function postCountLabel(n, lang) {
  if (lang !== 'pl') return `${n} ${n === 1 ? 'post' : 'posts'}`;
  if (n === 1) return '1 wpis';
  const digit = n % 10;
  const hundred = n % 100;
  const form = digit >= 2 && digit <= 4 && (hundred < 12 || hundred > 14) ? 'wpisy' : 'wpisów';
  return `${n} ${form}`;
}
