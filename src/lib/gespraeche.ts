// Vereinheitlicht zwei Quellen zu einer einzigen "Gespräche"-Liste:
//
// 1. Redaktionell gepflegte Episoden (src/content/episodes/*.md) – volle
//    Kontrolle über Titel, Teaser, Kategorie, Gast-Verknüpfung, Kapitel,
//    Zitate, Langtext.
// 2. Automatisch über die offizielle YouTube Data API geladene Uploads des
//    Kanals (src/lib/youtube.ts) – erscheinen ohne jedes manuelle Zutun,
//    sobald ein Video hochgeladen wird und der nächste Build läuft.
//
// Ein YouTube-Video, zu dem (über die im Frontmatter hinterlegte
// `youtubeCut`/`youtubeFull`-URL) eine redaktionelle Episode existiert,
// wird durch diese angereichert (Kategorie, Gast, Teaser, Kapitel, …).
// Ein Video ohne passende redaktionelle Datei bekommt trotzdem eine
// vollständige Seite – mit den echten Daten von YouTube (Titel,
// Beschreibung, Datum, Thumbnail), nicht mit erfundenen Inhalten.
//
// Damit ist "neues Video hochladen → erscheint auf der Website" End-to-End
// automatisch, sobald YOUTUBE_API_KEY/YOUTUBE_CHANNEL_ID gesetzt sind
// (siehe .env.example) – redaktionelle Pflege bleibt optional und
// erweitert eine automatisch entstandene Seite nachträglich, statt sie zu
// ersetzen.
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { extractYouTubeId, getLatestChannelVideos } from './youtube';
import { withBase } from '@/utils/paths';

export interface GespraechItem {
  slug: string;
  title: string;
  teaser: string;
  date: Date;
  category: string | null;
  videoId: string | null;
  thumbnailUrl: string | null;
  /** Vorhanden, sobald eine redaktionelle Episoden-Datei existiert. */
  curated: CollectionEntry<'episodes'> | null;
}

let cachedItems: GespraechItem[] | null = null;

function curatedVideoId(entry: CollectionEntry<'episodes'>): string | null {
  return extractYouTubeId(entry.data.youtubeCut) ?? extractYouTubeId(entry.data.youtubeFull);
}

/**
 * Liefert alle "Gespräche" – automatisch aus YouTube geladene Videos,
 * angereichert um passende redaktionelle Einträge, plus redaktionelle
 * Einträge ohne (aktuell) passendes Video – neueste zuerst.
 */
export async function getGespraeche(): Promise<GespraechItem[]> {
  if (cachedItems) return cachedItems;

  const curatedEntries = await getCollection('episodes');
  const videos = await getLatestChannelVideos(50);

  const curatedByVideoId = new Map<string, CollectionEntry<'episodes'>>();
  for (const entry of curatedEntries) {
    const id = curatedVideoId(entry);
    if (id) curatedByVideoId.set(id, entry);
  }

  const items: GespraechItem[] = [];
  const matchedCuratedSlugs = new Set<string>();

  for (const video of videos) {
    const curated = curatedByVideoId.get(video.videoId) ?? null;
    if (curated) matchedCuratedSlugs.add(curated.slug);

    // Ein im CMS/Frontmatter hinterlegtes Thumbnail geht vor dem
    // automatisch von YouTube gelieferten Vorschaubild.
    const thumbnailUrl = curated?.data.thumbnail ? withBase(curated.data.thumbnail) : video.thumbnailUrl;

    items.push({
      slug: curated ? curated.slug : video.videoId,
      title: curated ? curated.data.title : video.title,
      teaser: curated ? curated.data.description : video.description,
      date: curated ? curated.data.date : new Date(video.publishedAt),
      category: curated ? curated.data.category : null,
      videoId: video.videoId,
      thumbnailUrl,
      curated,
    });
  }

  // Redaktionelle Einträge, zu denen (noch) kein Video im abgerufenen
  // Fenster liegt (z.B. der Demo-Platzhalter ohne echte YouTube-URL, oder
  // ältere Videos jenseits von maxResults) – nicht verschwinden lassen.
  for (const entry of curatedEntries) {
    if (matchedCuratedSlugs.has(entry.slug)) continue;
    items.push({
      slug: entry.slug,
      title: entry.data.title,
      teaser: entry.data.description,
      date: entry.data.date,
      category: entry.data.category,
      videoId: curatedVideoId(entry),
      thumbnailUrl: entry.data.thumbnail ? withBase(entry.data.thumbnail) : null,
      curated: entry,
    });
  }

  items.sort((a, b) => b.date.valueOf() - a.date.valueOf());
  cachedItems = items;
  return items;
}
