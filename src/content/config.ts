import { defineCollection, z, reference } from 'astro:content';

// ---------------------------------------------------------------------------
// PERSONEN
// ---------------------------------------------------------------------------
// Jede Person entspricht später einer Seite unter /menschen/[slug]/.
// Der Dateiname (ohne .md) wird als slug verwendet.
const people = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      profession: z.string(),
      shortQuote: z.string().optional(),
      // Portrait als hochgeladenes Bild. Solange keine echten Portraits
      // vorliegen, bleibt das Feld leer und die Seite zeigt einen
      // typografischen Platzhalter (siehe PlaceholderVisual.astro).
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
  type: 'content',
  schema: ({ image }) =>
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
      thumbnail: image().optional(),
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
  type: 'content',
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
