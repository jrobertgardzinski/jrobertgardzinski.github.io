import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkCodeTitle from './plugins/remark-code-title.mjs';
import rehypeExternalLinks from './plugins/rehype-external-links.mjs';
import { darcula, intellijLight } from './plugins/shiki-themes.mjs';
import { REDIRECTS } from './src/lib/renames.js';

const site = 'https://jrobertgardzinski.pl';

export default defineConfig({
  site,
  integrations: [sitemap()],
  // urls of posts that changed their slug — without these, old links and search
  // results land on a 404 (src/lib/renames.js). On static hosting (GitHub Pages)
  // Astro renders each one as a meta-refresh page with a canonical link to the
  // new address, since there is nowhere to configure a real 301.
  redirects: REDIRECTS,
  markdown: {
    remarkPlugins: [remarkCodeTitle],
    // linki na zewnątrz serwisu → nowa karta (plugin zna własny host, żeby nie
    // wyrzucać czytelnika z serwisu przy linku podanym pełnym adresem)
    rehypePlugins: [[rehypeExternalLinks, { site }]],
    // custom IntelliJ-like themes; global.css switches them via [data-theme]
    shikiConfig: {
      themes: { light: intellijLight, dark: darcula },
    },
  },
});
