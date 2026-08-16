// Builds the site for the BDD suite into dist-test/.
// Test content is GENERATED here on the fly (no filler articles in the repo):
// the real Hello World is copied in as the anchor, filler posts are synthesized
// into a temporary, gitignored folder and removed after the build.
import { build } from 'astro';
import { execFileSync } from 'node:child_process';
import { rm, mkdir, writeFile, appendFile, copyFile } from 'node:fs/promises';

const postsDir = 'tests/.generated-posts';

// the posts dir becomes its own tiny git repo so the "updated from git" logic
// (src/lib/posts.ts) is exercised for real: commit #1 = publication,
// commit #2 (fixed date, one file) = modification
const git = (date, ...args) =>
  execFileSync('git', args, {
    cwd: postsDir,
    stdio: 'ignore',
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'BDD Suite',
      GIT_AUTHOR_EMAIL: 'bdd@example.test',
      GIT_COMMITTER_NAME: 'BDD Suite',
      GIT_COMMITTER_EMAIL: 'bdd@example.test',
      GIT_AUTHOR_DATE: date,
      GIT_COMMITTER_DATE: date,
    },
  });

const post = (front, body) => `---\n${front.trim()}\n---\n\n${body.trim()}\n`;
const write = (name, front, body) => writeFile(`${postsDir}/${name}`, post(front, body));

await rm(postsDir, { recursive: true, force: true });
await mkdir(postsDir, { recursive: true });

// the only real article anchors the fixture set (featured post, bilingual behavior, content assertions)
for (const f of ['hello-world.pl.md', 'hello-world.en.md']) {
  await copyFile(`src/content/posts/${f}`, `${postsDir}/${f}`);
}

await write(
  'fixture-pl-01.pl.md',
  `
title: "Fixture PL 01"
date: 2026-03-01
section: f1
project: hexagon-demo
tags: [spring, ddd]
excerpt: "Polski wpis testowy 01 (dział F1, projekt hexagon-demo, tagi spring i ddd)."
`,
  'Polski wpis testowy 01 używany przez suitę BDD.'
);

await write(
  'fixture-pl-02.pl.md',
  `
title: "Fixture PL 02"
date: 2026-03-02
section: it
project: benchmarki
tags: [ddd]
excerpt: "Polski wpis testowy 02 (dział IT, projekt benchmarki, tag ddd)."
`,
  'Polski wpis testowy 02 używany przez suitę BDD.'
);

await write(
  'fixture-syndicated.pl.md',
  `
title: "Fixture Syndicated"
date: 2026-03-05
section: it
tags: [fixture]
canonicalUrl: "https://example.com/original-article/"
excerpt: "Wpis syndykowany — adres kanoniczny wskazuje inne miejsce."
`,
  'Kopia artykułu, którego oryginał mieszka gdzie indziej — canonical wskazuje źródło.'
);

await write(
  'fixture-draft.pl.md',
  `
title: "Fixture Draft"
date: 2026-03-10
section: it
tags: [fixture]
excerpt: "Wpis roboczy — nie powinien być nigdzie opublikowany."
draft: true
`,
  'Wersja robocza używana przez suitę BDD — nie może pojawić się na liście, w RSS ani jako strona.'
);

// 13 English posts + the bilingual Hello World = 14 EN entries → two pages at 12/page
for (let i = 1; i <= 13; i++) {
  const n = String(i).padStart(2, '0');
  await write(
    `fixture-en-${n}.en.md`,
    `
title: "Fixture EN ${n}"
date: 2026-02-${n}
section: it
tags: [fixture]
excerpt: "English fixture post number ${n}."
`,
    `English fixture post number ${n} used by the BDD suite.`
  );
}

git('2026-03-02T12:00:00+02:00', 'init', '-q');
git('2026-03-02T12:00:00+02:00', 'add', '-A');
git('2026-03-02T12:00:00+02:00', 'commit', '-q', '-m', 'publish fixtures');
await appendFile(`${postsDir}/fixture-pl-01.pl.md`, '\n<!-- poprawka po publikacji -->\n');
git('2026-08-02T12:00:00+02:00', 'add', '-A');
git('2026-08-02T12:00:00+02:00', 'commit', '-q', '-m', 'update fixture-pl-01');

// The content-layer caches (.astro = types, node_modules/.astro = data store)
// are cleared before and after, so fixture and real content never bleed into
// each other's builds.
const clearCaches = async () => {
  await rm('.astro', { recursive: true, force: true });
  await rm('node_modules/.astro', { recursive: true, force: true });
};

process.env.POSTS_DIR = postsDir;
await clearCaches();
try {
  await build({ outDir: 'dist-test', logLevel: 'warn' });
} finally {
  await clearCaches();
  await rm(postsDir, { recursive: true, force: true });
}
