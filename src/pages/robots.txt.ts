import type { APIRoute } from 'astro';
import { siteConfig } from '@/config/site';

// Dynamisch generiert, damit die Sitemap-URL immer mit siteConfig.siteUrl
// übereinstimmt – keine zweite Stelle, die bei Domain-Wechsel vergessen
// werden könnte.
export const GET: APIRoute = () => {
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${siteConfig.siteUrl}/sitemap-index.xml\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
