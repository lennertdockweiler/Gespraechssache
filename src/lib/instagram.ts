// Offizielle "Instagram API with Instagram Login" (Meta Graph API für
// Instagram Business-/Creator-Accounts).
// Doku: https://developers.facebook.com/docs/instagram-platform
//
// Anwendungsfall hier: ausschließlich Inhalte des EIGENEN offiziellen
// Gesprächssache-Instagram-Accounts auf der eigenen Website anzeigen
// ("Gedanken & Begegnungen"). Kein Scraping, keine inoffizielle API.
//
// Wie bei src/lib/youtube.ts: Aufruf ausschließlich serverseitig zur
// Build-Zeit aus Astro-Frontmatter, nie aus einem <script>-Block. Fehlen
// Token/User-ID oder schlägt der Request fehl, wird eine leere Liste
// zurückgegeben – kein Crash, der Bereich blendet sich dann aus.
//
// EINSCHRÄNKUNG (siehe Abschlussbericht): `media_url` von Instagram ist
// eine zeitlich befristete, signierte CDN-URL – kein dauerhafter Link.
// Wir speichern/rehosten sie nicht, sondern binden sie nur zur Build-Zeit
// direkt ein. Bei jedem (geplanten) Rebuild wird eine frische URL geholt.
// Bleibt die Website zwischen zwei Rebuilds sehr lange offline, kann ein
// zwischenzeitlich abgelaufener Bild-Link vorkommen – dagegen hilft nur
// ein regelmäßiger Rebuild (siehe deploy.yml) oder erneutes Bauen.

export interface InstagramPost {
  id: string;
  caption: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  permalink: string;
  timestamp: string;
}

interface InstagramMediaResponse {
  data?: Array<{
    id: string;
    caption?: string;
    media_type?: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
    media_url?: string;
    thumbnail_url?: string;
    permalink?: string;
    timestamp?: string;
  }>;
}

// Meta-Graph-API-Version. Meta veröffentlicht regelmäßig (ca. alle
// 6–12 Monate) neue Versionen und setzt ältere nach ca. 2 Jahren ab –
// dieser Wert sollte gelegentlich gegen die aktuelle Version in der
// offiziellen Doku geprüft/aktualisiert werden.
const API_VERSION = 'v21.0';

let latestPostsCache: InstagramPost[] | null = null;

/**
 * Lädt die neuesten Medien des eigenen Instagram-Business-/Creator-Accounts
 * über den `/media`-Edge des IG-User-Objekts.
 */
export async function getLatestInstagramPosts(maxResults = 6): Promise<InstagramPost[]> {
  if (latestPostsCache) return latestPostsCache;

  const accessToken = import.meta.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = import.meta.env.INSTAGRAM_USER_ID;
  if (!accessToken || !userId) return [];

  try {
    const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp';
    const url = `https://graph.instagram.com/${API_VERSION}/${encodeURIComponent(userId)}/media?fields=${fields}&limit=${maxResults}&access_token=${encodeURIComponent(accessToken)}`;
    const response = await fetch(url);
    if (!response.ok) return [];

    const data = (await response.json()) as InstagramMediaResponse;
    const posts: InstagramPost[] = (data.data ?? [])
      .filter((item) => Boolean(item.permalink) && Boolean(item.media_type))
      .map((item) => ({
        id: item.id,
        caption: item.caption ?? '',
        mediaType: item.media_type!,
        mediaUrl: item.media_url ?? null,
        thumbnailUrl: item.thumbnail_url ?? null,
        permalink: item.permalink!,
        timestamp: item.timestamp ?? new Date().toISOString(),
      }));

    latestPostsCache = posts;
    return posts;
  } catch {
    return [];
  }
}
