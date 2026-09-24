import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// Deployment auf die eigene Hauptdomain gespraechssache.de über GitHub
// Pages (CNAME in public/CNAME, siehe dort). Läuft an der Domain-Root,
// deshalb `base: '/'` – kein Unterpfad mehr wie zuvor beim
// *.github.io-Projekt-Pfad. Bewusst die reine ASCII-Schreibweise
// ("ae" statt "ä") statt der früheren IDN-Domain gesprächssache.de –
// keine Punycode-Normalisierung mehr nötig, muss mit siteConfig.siteUrl
// übereinstimmen.
const SITE_URL = 'https://gespraechssache.de';
const BASE_PATH = '/';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
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
