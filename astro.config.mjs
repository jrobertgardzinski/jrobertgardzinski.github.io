import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkCodeTitle from './plugins/remark-code-title.mjs';
import rehypeExternalLinks from './plugins/rehype-external-links.mjs';
import { darcula, intellijLight } from './plugins/shiki-themes.mjs';

const site = 'https://jrobertgardzinski.pl';

export default defineConfig({
  site,
  integrations: [sitemap()],
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
