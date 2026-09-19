// Offizielle YouTube Data API v3 (https://developers.google.com/youtube/v3).
//
// WICHTIG: Dieses Modul wird ausschließlich aus Astro-Frontmatter
// (serverseitig, zur Build-Zeit) importiert – niemals aus einem
// <script>-Block. Dadurch landet der API-Key nie im Client-Bundle.
//
// Diese Website ist ein rein statischer Build (kein SSR-Adapter, Hosting
// auf GitHub Pages ohne Serverlaufzeit). "Serverseitig" bedeutet hier
// deshalb: der Abruf passiert einmal während `astro build`, nicht bei
// jedem Seitenaufruf im Browser. Caching/Revalidation wird dadurch
// erreicht, dass der Rebuild nur in einem festen Intervall automatisch
// läuft (siehe .github/workflows/deploy.yml, `schedule`-Trigger) – Besuche
// der Website selbst lösen NIE einen YouTube-Request aus.
//
// Fehlt der API-Key/die Channel-ID, oder schlägt der Request fehl (Netzwerk,
// Quota, API-Fehler), liefert dieses Modul einfach eine leere Liste zurück.
// Es wird nirgends geworfen/gecrasht – Aufrufer blenden den jeweiligen
// Bereich dann einfach aus.

export interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
}

interface YouTubeChannelsResponse {
  items?: Array<{
    contentDetails?: {
      relatedPlaylists?: { uploads?: string };
    };
  }>;
}

interface YouTubePlaylistItemsResponse {
  items?: Array<{
    snippet?: {
      title?: string;
      description?: string;
      publishedAt?: string;
      resourceId?: { videoId?: string };
      thumbnails?: {
        high?: { url?: string };
        medium?: { url?: string };
        default?: { url?: string };
      };
    };
  }>;
}

const API_BASE = 'https://www.googleapis.com/youtube/v3';

/**
 * Extrahiert die YouTube-Video-ID aus gängigen offiziellen URL-Formen
 * (watch?v=, youtu.be/, /shorts/, /embed/, bereits nocookie-Domain).
 * Wird u.a. von YouTubePlayer.astro genutzt, um aus den in den
 * Episoden-Frontmatter-Feldern (`youtubeFull`/`youtubeCut`) hinterlegten
 * vollständigen URLs die ID für den offiziellen Embed zu gewinnen.
 */
export function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.replace(/^\//, '') || null;
    }
    const shortsMatch = parsed.pathname.match(/\/shorts\/([^/?]+)/);
    if (shortsMatch) return shortsMatch[1];
    const embedMatch = parsed.pathname.match(/\/embed\/([^/?]+)/);
    if (embedMatch) return embedMatch[1];
    return parsed.searchParams.get('v');
  } catch {
    return null;
  }
}

// Modul-lokale Caches, jeweils pro Kanal-ID: verhindern, dass innerhalb
// EINES Build-Laufs mehrere Komponenten (z.B. Startseite + /gespraeche,
// oder Haupt- und Uncut-Kanal) denselben Request mehrfach auslösen.
const uploadsPlaylistIdCache = new Map<string, string | null>();
const latestVideosCache = new Map<string, YouTubeVideo[]>();

async function getUploadsPlaylistId(apiKey: string, channelId: string): Promise<string | null> {
  const cached = uploadsPlaylistIdCache.get(channelId);
  if (cached !== undefined) return cached;

  const url = `${API_BASE}/channels?part=contentDetails&id=${encodeURIComponent(channelId)}&key=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) {
    uploadsPlaylistIdCache.set(channelId, null);
    return null;
  }

  const data = (await response.json()) as YouTubeChannelsResponse;
  const uploadsPlaylistId = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null;
  uploadsPlaylistIdCache.set(channelId, uploadsPlaylistId);
  return uploadsPlaylistId;
}

/**
 * Lädt die neuesten Video-Uploads eines YouTube-Kanals über
 * `playlistItems.list` auf dessen Uploads-Playlist. Das ist der von Google
 * empfohlene, quota-schonende Weg (1 Unit statt 100 Units bei
 * `search.list`), um "neueste Videos eines Kanals" zu lesen.
 */
async function getLatestVideosForChannel(channelId: string, maxResults: number): Promise<YouTubeVideo[]> {
  const cached = latestVideosCache.get(channelId);
  if (cached) return cached;

  const apiKey = import.meta.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  try {
    const uploadsPlaylistId = await getUploadsPlaylistId(apiKey, channelId);
    if (!uploadsPlaylistId) return [];

    const url = `${API_BASE}/playlistItems?part=snippet&playlistId=${encodeURIComponent(uploadsPlaylistId)}&maxResults=${maxResults}&key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) return [];

    const data = (await response.json()) as YouTubePlaylistItemsResponse;
    const videos: YouTubeVideo[] = (data.items ?? [])
      .filter((item) => Boolean(item.snippet?.resourceId?.videoId))
      .map((item) => ({
        videoId: item.snippet!.resourceId!.videoId!,
        title: item.snippet?.title ?? '',
        description: item.snippet?.description ?? '',
        publishedAt: item.snippet?.publishedAt ?? new Date().toISOString(),
        thumbnailUrl:
          item.snippet?.thumbnails?.high?.url ??
          item.snippet?.thumbnails?.medium?.url ??
          item.snippet?.thumbnails?.default?.url ??
          '',
      }));

    latestVideosCache.set(channelId, videos);
    return videos;
  } catch {
    // Netzwerkfehler, Quota-Überschreitung, ungültiger Key, o.ä.
    // Bewusst kein Logging von Fehlerdetails, die den API-Key enthalten
    // könnten – siehe Security-Hinweise im Abschlussbericht.
    return [];
  }
}

/**
 * Neueste Uploads des Hauptkanals (YOUTUBE_CHANNEL_ID_MAIN) – treibt die
 * automatische "Gespräche"-Befüllung an (src/lib/gespraeche.ts).
 */
export async function getLatestChannelVideos(maxResults = 6): Promise<YouTubeVideo[]> {
  const channelId = import.meta.env.YOUTUBE_CHANNEL_ID_MAIN;
  if (!channelId) return [];
  return getLatestVideosForChannel(channelId, maxResults);
}

/**
 * Neueste Uploads des zweiten, ungeschnittenen Kanals
 * (YOUTUBE_CHANNEL_ID_UNCUT) – treibt den separaten "Ganze Gespräche"-
 * Bereich an (src/pages/ganze-gespraeche/). Bewusst kein Versuch, diese
 * automatisch mit einem Hauptkanal-Video zu verknüpfen (zu fehleranfällig
 * ohne verlässlichen gemeinsamen Schlüssel) – beide Bereiche laufen
 * unabhängig nebeneinander; eine Verknüpfung ist weiterhin manuell über
 * das `youtubeFull`-Feld einer redaktionellen Episode möglich.
 */
export async function getLatestUncutVideos(maxResults = 12): Promise<YouTubeVideo[]> {
  const channelId = import.meta.env.YOUTUBE_CHANNEL_ID_UNCUT;
  if (!channelId) return [];
  return getLatestVideosForChannel(channelId, maxResults);
}
