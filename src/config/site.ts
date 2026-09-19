// Zentrale Projekt- und Plattform-Konfiguration.
// Alle Links, Namen und URLs, die an mehreren Stellen der Website auftauchen,
// werden ausschließlich hier gepflegt. Nichts davon wird an anderer Stelle
// hart codiert.
//
// WICHTIG: Werte, die noch nicht feststehen (z.B. echte Social-Media-URLs),
// bleiben als `null` stehen. Komponenten, die diese Konfiguration nutzen,
// blenden fehlende Plattformen aus bzw. markieren sie sichtbar als "bald".
// Es werden hier keine erfundenen Accounts oder URLs eingetragen.

export interface PlatformLink {
  label: string;
  url: string | null;
}

export const siteConfig = {
  projectName: 'Gesprächssache',
  tagline: 'Interessante Menschen. Gute Fragen. Echte Gespräche.',
  // Muss mit `site` in astro.config.mjs übereinstimmen.
  siteUrl: 'https://gesprächssache.de',
  // TODO: echte Kontakt-/Presse-Adresse eintragen, sobald vorhanden.
  contactEmail: null as string | null,
  locale: 'de-DE',

  host: {
    name: 'Lennert',
    // TODO: Host-Bio ergänzen, sobald finale Inhalte vorliegen.
  },
};

// Plattformen für Header/Footer/„Überall hören und sehen“-Sektion.
// `url: null` → Button wird als „bald verfügbar“ dargestellt bzw. optional ausgeblendet.
export const platforms: Record<string, PlatformLink> = {
  youtubeFull: { label: 'YouTube – Ganze Gespräche', url: null },
  youtubeMain: { label: 'YouTube – Hauptkanal', url: null },
  spotify: { label: 'Spotify', url: null },
  applePodcasts: { label: 'Apple Podcasts', url: null },
  instagram: { label: 'Instagram', url: null },
  tiktok: { label: 'TikTok', url: null },
  threads: { label: 'Threads', url: null },
  facebook: { label: 'Facebook', url: null },
};

export const primaryNav = [
  { label: 'Gespräche', href: '/gespraeche/' },
  { label: 'Menschen', href: '/menschen/' },
  { label: 'Kurz gefragt', href: '/kurz-gefragt/' },
  { label: 'Über das Projekt', href: '/ueber-gespraechssache/' },
];

export const footerNav = [
  { label: 'Gespräche', href: '/gespraeche/' },
  { label: 'Ganze Gespräche', href: '/ganze-gespraeche/' },
  { label: 'Menschen', href: '/menschen/' },
  { label: 'Kurz gefragt', href: '/kurz-gefragt/' },
  { label: 'Gast vorschlagen', href: '/gast-vorschlagen/' },
  { label: 'Über das Projekt', href: '/ueber-gespraechssache/' },
];

export const legalNav = [
  { label: 'Impressum', href: '/impressum/' },
  { label: 'Datenschutz', href: '/datenschutz/' },
  { label: 'Kontakt', href: '/kontakt/' },
];

export const categories = [
  'Unternehmertum',
  'Beruf',
  'Wissenschaft',
  'Sport',
  'Kreativität',
  'Lebensgeschichte',
  'Leidenschaft',
  'Gesellschaft',
  'Abenteuer',
] as const;

export type Category = (typeof categories)[number];
