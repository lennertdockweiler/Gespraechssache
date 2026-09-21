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
  // Punycode/ASCII-Form der Domain (siehe public/CNAME), nicht die
  // Unicode-Schreibweise: `new URL()` (SEO.astro) und @astrojs/sitemap
  // normalisieren IDN-Domains ohnehin automatisch dahin – mit dieser Form
  // als Quelle stimmen auch die von Hand gebauten JSON-LD-/robots.txt-URLs
  // (die kein `new URL()` durchlaufen) überein, statt zwei unterschiedliche
  // Schreibweisen derselben Domain im ausgelieferten HTML zu mischen.
  // Muss mit `site` in astro.config.mjs übereinstimmen.
  siteUrl: 'https://xn--gesprchssache-ffb.de',
  // Hinweis: Unicode-Domain im lokalen Teil einer E-Mail-Adresse wird nicht von
  // jedem Mailserver unterstützt (Email Address Internationalization/EAI ist
  // noch nicht überall verbreitet) – Zustellbarkeit von extern am besten einmal
  // testen, sonst ggf. auf die Punycode-Form (hallo@xn--gesprchssache-ffb.de)
  // ausweichen, falls das eigene Postfach darüber läuft.
  contactEmail: 'hallo@gesprächssache.de' as string | null,
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
