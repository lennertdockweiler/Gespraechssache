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

// Modul-lokaler Cache: verhindert, dass innerhalb EINES Build-Laufs
// mehrere Komponenten (z.B. Startseite + /gespraeche) denselben Request
// mehrfach auslösen.
let uploadsPlaylistIdCache: string | null | undefined;
let latestVideosCache: YouTubeVideo[] | null = null;

async function getUploadsPlaylistId(apiKey: string, channelId: string): Promise<string | null> {
  if (uploadsPlaylistIdCache !== undefined) return uploadsPlaylistIdCache;

  const url = `${API_BASE}/channels?part=contentDetails&id=${encodeURIComponent(channelId)}&key=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) {
    uploadsPlaylistIdCache = null;
    return null;
  }

  const data = (await response.json()) as YouTubeChannelsResponse;
  uploadsPlaylistIdCache = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null;
  return uploadsPlaylistIdCache;
}

/**
 * Lädt die neuesten Video-Uploads des in YOUTUBE_CHANNEL_ID konfigurierten
 * Kanals über `playlistItems.list` auf der Uploads-Playlist des Kanals.
 * Das ist der von Google empfohlene, quota-schonende Weg (1 Unit statt
 * 100 Units bei `search.list`), um "neueste Videos eines Kanals" zu lesen.
 */
export async function getLatestChannelVideos(maxResults = 6): Promise<YouTubeVideo[]> {
  if (latestVideosCache) return latestVideosCache;

  const apiKey = import.meta.env.YOUTUBE_API_KEY;
  const channelId = import.meta.env.YOUTUBE_CHANNEL_ID;
  if (!apiKey || !channelId) return [];

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

    latestVideosCache = videos;
    return videos;
  } catch {
    // Netzwerkfehler, Quota-Überschreitung, ungültiger Key, o.ä.
    // Bewusst kein Logging von Fehlerdetails, die den API-Key enthalten
    // könnten – siehe Security-Hinweise im Abschlussbericht.
    return [];
  }
}
