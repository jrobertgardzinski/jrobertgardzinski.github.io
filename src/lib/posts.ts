import { getCollection, type CollectionEntry } from 'astro:content';
import { execFileSync } from 'node:child_process';
import { basename, dirname, resolve } from 'node:path';

export type Post = CollectionEntry<'posts'>;
export type Lang = 'pl' | 'en';

export const slugOf = (p: Post) => p.id.replace(/\.(pl|en)$/, '');

/** Language comes from the file name — `{slug}.pl.md` / `{slug}.en.md`, never from the frontmatter. */
export function langOf(p: Post): Lang {
  const m = /\.(pl|en)$/.exec(p.id);
  if (!m) throw new Error(`Post "${p.id}" has no language suffix — name the file {slug}.pl.md or {slug}.en.md`);
  return m[1] as Lang;
}

export const urlOf = (p: Post) => `/wpisy/${langOf(p)}/${slugOf(p)}/`;
export const fmtDate = (d: Date) => d.toISOString().slice(0, 10);

export function readingTimeOf(p: Post): number {
  if (p.data.readingTime) return p.data.readingTime;
  const words = (p.body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function excerptOf(p: Post): string {
  if (p.data.excerpt) return p.data.excerpt;
  const text = (p.body ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > 180 ? text.slice(0, 177) + '…' : text;
}

export const searchTextOf = (p: Post) =>
  [p.data.title, excerptOf(p), ...p.data.tags].join(' ').toLowerCase();

const gitDates = new Map<string, Date | undefined>();

/**
 * Modification date taken from git at build time: the file's FIRST commit is
 * the publication, so a date is returned only when there are later commits.
 * No git history (new file, no repo, shallow checkout) → undefined.
 */
export function updatedOf(p: Post): Date | undefined {
  const filePath = p.filePath;
  if (!filePath) return undefined;
  if (gitDates.has(filePath)) return gitDates.get(filePath);
  let updated: Date | undefined;
  try {
    const abs = resolve(filePath);
    const log = execFileSync('git', ['log', '--format=%cI', '--', basename(abs)], {
      cwd: dirname(abs),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    const commits = log ? log.split('\n') : [];
    if (commits.length > 1) updated = new Date(commits[0]);
  } catch {
    // git unavailable or file untracked — treat as never modified
  }
  gitDates.set(filePath, updated);
  return updated;
}

/** All published posts, newest first. Drafts show up only in `npm run dev` (with a "szkic" badge). */
export async function allPosts(): Promise<Post[]> {
  const showDrafts = import.meta.env.DEV;
  const posts = await getCollection('posts', ({ data }) => showDrafts || !data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export interface PostGroup {
  slug: string;
  /** languages present, always in [pl, en] order */
  langs: Lang[];
  variants: Partial<Record<Lang, Post>>;
  date: Date;
  section: string;
  project: string;
  /** tags per language — a post's tags are written in the language of that post */
  tags: Record<Lang, string[]>;
}

/** One list row per slug — a bilingual post (two files sharing a slug) becomes a single group. */
export function groupBySlug(posts: Post[]): PostGroup[] {
  const map = new Map<string, PostGroup>();
  for (const p of posts) {
    const slug = slugOf(p);
    let g = map.get(slug);
    if (!g) {
      g = { slug, langs: [], variants: {}, date: p.data.date, section: p.data.section, project: p.data.project ?? '', tags: { pl: [], en: [] } };
      map.set(slug, g);
    }
    const lang = langOf(p);
    g.variants[lang] = p;
    if (p.data.date > g.date) g.date = p.data.date;
    if (p.data.project) g.project = p.data.project;
    for (const t of p.data.tags) if (!g.tags[lang].includes(t)) g.tags[lang].push(t);
  }
  for (const g of map.values()) {
    g.langs = (['pl', 'en'] as Lang[]).filter((l) => g.variants[l]);
  }
  return [...map.values()].sort((a, b) => b.date.getTime() - a.date.getTime());
}
