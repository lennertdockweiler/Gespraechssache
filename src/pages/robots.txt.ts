import type { APIRoute } from 'astro';
import { siteConfig } from '@/config/site';
import { withBase } from '@/utils/paths';

// Dynamisch generiert, damit die Sitemap-URL immer mit siteConfig.siteUrl
// und dem Astro-`base`-Pfad übereinstimmt – keine zweite Stelle, die bei
// Domain-/Pfad-Wechsel vergessen werden könnte.
export const GET: APIRoute = () => {
  const body = `User-agent: *\nAllow: /\nDisallow: ${withBase('/admin/')}\n\nSitemap: ${siteConfig.siteUrl}${withBase('/sitemap-index.xml')}\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
