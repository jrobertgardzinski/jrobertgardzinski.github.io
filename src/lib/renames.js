// Posts whose URL changed because their Markdown file was renamed — the slug is
// the file name (urlOf in src/lib/posts.ts), so renaming a file moves the post.
// Maps the CURRENT url of a post to every url it used to live at.
//
// Two things read this map, because a moved post leaves two things behind:
//   * astro.config.mjs turns each old url into a redirect page, so links and
//     search results pointing at the old address keep working;
//   * the visit counter (src/lib/views.ts and the refresh script on the post
//     page) adds up the visits of ALL of a post's addresses. GoatCounter keys
//     visits by path and knows nothing about the rename, so a renamed post asks
//     about a path the service has never seen, gets a 404 and shows no counter
//     at all — which is exactly what the 2026-08-29 rename did to these three.
//
// Entries are forever: an old url keeps its redirect and keeps contributing its
// visits for as long as the post exists.
const RENAMED_ON_2026_08_29 = {
  '/wpisy/pl/painting-tricks/': ['/wpisy/pl/malowanie/'],
  '/wpisy/pl/meme-sandbox/': ['/wpisy/pl/piaskownica-z-memami/'],
  '/wpisy/pl/bolognese-sauce/': ['/wpisy/pl/sos-bolognese/'],
};

// overridable so the BDD fixture build can rename a fixture post instead of the
// real ones — same trick as POSTS_DIR in src/content.config.ts
export const RENAMED_PATHS = process.env.RENAMED_PATHS
  ? JSON.parse(process.env.RENAMED_PATHS)
  : RENAMED_ON_2026_08_29;

/** Urls this post used to live at — empty for everything that was never renamed. */
export const formerPathsOf = (path) => RENAMED_PATHS[path] ?? [];

/** old url -> current url, the shape astro.config.mjs wants for `redirects`. */
export const REDIRECTS = Object.fromEntries(
  Object.entries(RENAMED_PATHS).flatMap(([to, froms]) => froms.map((from) => [from, to]))
);
