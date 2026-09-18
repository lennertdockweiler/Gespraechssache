import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// GitHub-Pages-Deployment: Projekt-Seiten laufen unter einem Unterpfad
// (https://<user>.github.io/<repo>/), da das Repo nicht "<user>.github.io"
// heißt. `site` bleibt die reine Origin, `base` trägt den Repo-Namen.
//
// TODO: Bei Umzug auf eine eigene Domain (Vercel/Netlify/Custom Domain):
// `site` auf die finale Domain setzen und `base` auf '/' zurücksetzen –
// dann auch src/config/site.ts → siteUrl entsprechend anpassen. Interne
// Links laufen bereits base-path-bewusst über src/utils/paths.ts und
// brauchen dafür keine weitere Anpassung.
const SITE_URL = 'https://lennertdockweiler.github.io';
const BASE_PATH = '/Gespraechssache';

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
