import { defineCollection, z, reference } from 'astro:content';
import { glob } from 'astro/loaders';

// ---------------------------------------------------------------------------
// PERSONEN
// ---------------------------------------------------------------------------
// Jede Person entspricht später einer Seite unter /menschen/[slug]/.
// Der Dateiname (ohne .md) wird über den glob()-Loader zur `id` (ersetzt das
// frühere `slug` der Legacy-Content-Collections-API, aber identisch
// generiert – siehe Astro-Upgrade-Notizen).
const people = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/people' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      profession: z.string(),
      shortQuote: z.string().optional(),
      // Portrait über Astros image()-Schema-Helper: Datei liegt unter
      // src/assets/uploads/people/ (siehe public/admin/config.yml, relativ
      // zum jeweiligen Content-Eintrag konfiguriert) und wird dadurch von
      // Astro zur Build-Zeit automatisch optimiert (WebP/AVIF, responsives
      // srcset) statt als rohe Datei durchgereicht zu werden – siehe
      // <Image>-Nutzung in PersonCard.astro/menschen/[slug].astro. Solange
      // leer, zeigt die Seite einen typografischen Platzhalter (siehe
      // PlaceholderVisual.astro).
      portrait: image().optional(),
      website: z.string().url().optional(),
      socials: z
        .object({
          instagram: z.string().url().optional(),
          tiktok: z.string().url().optional(),
          linkedin: z.string().url().optional(),
          website: z.string().url().optional(),
        })
        .optional(),
      // Ist dieser Gast noch nicht real bestätigt, sondern reine
      // Beispiel-/Platzhalterdaten für die Darstellung von V1?
      placeholder: z.boolean().default(false),
    }),
});

// ---------------------------------------------------------------------------
// GESPRÄCHE (EPISODEN)
// ---------------------------------------------------------------------------
const episodeChapter = z.object({
  title: z.string(),
  timestamp: z.string(), // z.B. "00:00" – Referenzwert für die Vollversion
});

const episodes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/episodes' }),
  schema: () =>
    z.object({
      title: z.string(),
      guest: reference('people'),
      episodeNumber: z.number().int().positive(),
      description: z.string(),
      date: z.date(),
      durationFull: z.string(), // z.B. "2:14:30"
      durationCut: z.string(), // z.B. "32:10"
      category: z.enum([
        'Unternehmertum',
        'Beruf',
        'Wissenschaft',
        'Sport',
        'Kreativität',
        'Lebensgeschichte',
        'Leidenschaft',
        'Gesellschaft',
        'Abenteuer',
      ]),
      tags: z.array(z.string()).default([]),
      // Wie portrait: Pfad relativ zum Public-Ordner, vom CMS hochgeladen.
      thumbnail: z.string().optional(),
      // Externe Plattform-Links pro Episode. Bleiben leer, bis die
      // jeweilige Episode tatsächlich veröffentlicht wurde.
      youtubeFull: z.string().url().optional(),
      youtubeCut: z.string().url().optional(),
      spotify: z.string().url().optional(),
      applePodcast: z.string().url().optional(),
      instagramClips: z.array(z.string().url()).default([]),
      tiktokClips: z.array(z.string().url()).default([]),
      chapters: z.array(episodeChapter).default([]),
      featured: z.boolean().default(false),
      placeholder: z.boolean().default(false),
    }),
});

// ---------------------------------------------------------------------------
// KURZ GEFRAGT (STRASSENFORMAT)
// ---------------------------------------------------------------------------
const streetInterviews = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/streetInterviews' }),
  schema: () =>
    z.object({
      question: z.string(),
      // Anonymisierte Kurzbeschreibung der befragten Person, z.B. "34, Handwerker".
      personLabel: z.string(),
      date: z.date(),
      instagramUrl: z.string().url().optional(),
      tiktokUrl: z.string().url().optional(),
      youtubeShortUrl: z.string().url().optional(),
      placeholder: z.boolean().default(false),
    }),
});

export const collections = { people, episodes, streetInterviews };
