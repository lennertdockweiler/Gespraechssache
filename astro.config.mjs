import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// Deployment auf die eigene Domain gesprächssache.de über GitHub Pages
// (CNAME in public/CNAME, siehe dort). Läuft an der Domain-Root, deshalb
// `base: '/'` – kein Unterpfad mehr wie zuvor beim *.github.io-Projekt-Pfad.
// Punycode-Form (siehe Kommentar zu siteUrl in src/config/site.ts) – muss
// mit siteConfig.siteUrl übereinstimmen.
const SITE_URL = 'https://xn--gesprchssache-ffb.de';
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
