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
  // Haupt-/Kaufdomain, bewusst die reine ASCII-Schreibweise ("ae" statt "ä")
  // statt der früheren IDN-Domain gesprächssache.de – dadurch keine
  // Punycode-Normalisierungsfragen mehr (siehe Git-Historie: canonical/OG/
  // Sitemap normalisierten IDN-Domains automatisch, von Hand gebaute
  // JSON-LD-/robots.txt-URLs taten das nicht – dieses Problem existiert mit
  // einer reinen ASCII-Domain gar nicht erst).
  // Muss mit `site` in astro.config.mjs übereinstimmen.
  siteUrl: 'https://gespraechssache.de',
  contactEmail: 'hallo@gespraechssache.de' as string | null,
  locale: 'de-DE',

  host: {
    name: 'Lennert',
    // TODO: Host-Bio ergänzen, sobald finale Inhalte vorliegen.
  },
};

// Plattformen für Header/Footer/„Überall hören und sehen“-Sektion.
// `url: null` → Eintrag bleibt sichtbar, aber nicht-klickbar, bis die
// echte URL eingetragen wird.
export const platforms: Record<string, PlatformLink> = {
  youtubeMain: { label: 'YouTube – Hauptkanal', url: null },
  youtubeFull: { label: 'YouTube – Ganze Gespräche', url: null },
  instagram: { label: 'Instagram', url: null },
  tiktok: { label: 'TikTok', url: null },
  spotify: { label: 'Spotify', url: null },
  applePodcasts: { label: 'Apple Podcasts', url: null },
};

export const primaryNav = [
  { label: 'Gespräche', href: '/gespraeche/' },
  { label: 'Ganze Gespräche', href: '/ganze-gespraeche/' },
  { label: 'Kurz gefragt', href: '/kurz-gefragt/' },
  { label: 'Über das Projekt', href: '/ueber-gespraechssache/' },
];

export const footerNav = [
  { label: 'Gespräche', href: '/gespraeche/' },
  { label: 'Ganze Gespräche', href: '/ganze-gespraeche/' },
  { label: 'Kurz gefragt', href: '/kurz-gefragt/' },
  { label: 'Gast vorschlagen', href: '/gast-vorschlagen/' },
  { label: 'Über das Projekt', href: '/ueber-gespraechssache/' },
  { label: 'Häufige Fragen', href: '/faq/' },
  { label: 'Presse', href: '/presse/' },
];

export const legalNav = [
  { label: 'Impressum', href: '/impressum/' },
  { label: 'Datenschutz', href: '/datenschutz/' },
  { label: 'Nutzungsbedingungen', href: '/nutzungsbedingungen/' },
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
