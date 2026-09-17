import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// TODO: In `siteUrl` in src/config/site.ts UND hier die finale Produktions-Domain eintragen,
// sobald sie feststeht. Bis dahin ist ein Platzhalter gesetzt.
const SITE_URL = 'https://www.gespraechssache.example';

export default defineConfig({
  site: SITE_URL,
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
  ],
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});
