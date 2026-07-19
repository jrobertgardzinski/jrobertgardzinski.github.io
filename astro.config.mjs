import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkCodeTitle from './plugins/remark-code-title.mjs';
import { darcula, intellijLight } from './plugins/shiki-themes.mjs';

export default defineConfig({
  site: 'https://jrobertgardzinski.pl',
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkCodeTitle],
    // custom IntelliJ-like themes; global.css switches them via [data-theme]
    shikiConfig: {
      themes: { light: intellijLight, dark: darcula },
    },
  },
});
