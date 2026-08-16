import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// One post = one .md file; a bilingual post is TWO files sharing a slug:
// hello-world.pl.md + hello-world.en.md
const posts = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    // the BDD suite builds from fixture content (tests/build-fixtures.mjs)
    base: process.env.POSTS_DIR ?? './src/content/posts',
    // keep the ".pl"/".en" suffix intact in the id — it IS the language (see langOf in lib/posts)
    // (default slugger would eat the dot)
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    section: z.enum(['it', 'f1', 'diy', 'cooking']).default('it'),
    project: z.string().optional(),
    tags: z.array(z.string()).default([]),
    excerpt: z.string().optional(),
    readingTime: z.number().optional(),
    draft: z.boolean().default(false),
    // syndication: set when the ORIGINAL of this post lives elsewhere —
    // the page will declare that address as canonical instead of its own
    canonicalUrl: z.string().url().optional(),
  }),
});

export const collections = { posts };
