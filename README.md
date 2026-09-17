# Gesprächssache — Website (V1)

Editoriale Website für das Interviewformat **Gesprächssache**. Gebaut mit
[Astro](https://astro.build) (statische Seiten, file-based Routing,
Content Collections) und Tailwind CSS.

## Entwicklung

```bash
npm install
npm run dev       # lokaler Dev-Server, siehe ausgegebene URL
npm run build      # Type-Check + Produktions-Build nach dist/
npm run preview     # gebautes Ergebnis lokal ansehen
```

## Projektstruktur

```
src/
  config/site.ts          zentrale Konfiguration: Projektname, Plattform-Links, Navigation
  content/                Datenmodell (Episoden, Personen, Kurz-gefragt-Clips)
    config.ts               Zod-Schemas der drei Collections
    episodes/*.md            Episoden (Platzhalterdaten)
    people/*.md               Gäste (Platzhalterdaten)
    streetInterviews/*.md      Kurz-gefragt-Clips (Platzhalterdaten)
  components/              wiederverwendbare Bausteine (Cards, Header, Footer, …)
  layouts/Layout.astro     Basis-Layout: SEO, Structured Data, Header/Footer, Scroll-Progress
  pages/                   Routen (1:1 zur URL-Struktur, siehe unten)
  scripts/                 kleine, framework-lose Vanilla-TS-Module (Motion, Filter, Formular)
  styles/global.css        Design-Tokens (Farben, Motion) + globale Basisstile
```

## Neue Episode hinzufügen

1. Datei anlegen: `src/content/episodes/episode-006.md` (Dateiname = spätere URL
   `/gespraeche/episode-006/`).
2. Frontmatter ausfüllen (siehe bestehende Dateien als Vorlage), insbesondere
   `guest` mit dem Slug einer existierenden Person aus `src/content/people/`.
3. `placeholder: false` setzen, sobald es sich um eine echte, veröffentlichte
   Episode handelt (steuert u.a., ob VideoObject-Structured-Data ausgegeben wird).
4. Fertig — die Episode erscheint automatisch in `/gespraeche/`, in der Filterliste,
   auf der Personenseite des Gasts und ggf. auf der Startseite (bei `featured: true`).

## Neuen Gast hinzufügen

1. Datei anlegen: `src/content/people/vorname-nachname.md` (Dateiname = Slug =
   spätere URL `/menschen/vorname-nachname/`).
2. Frontmatter ausfüllen. `portrait` kann vorerst weggelassen werden — ohne Bild
   wird automatisch ein hochwertiger typografischer Platzhalter angezeigt
   (`PlaceholderVisual.astro`).
3. Sobald ein echtes Portrait vorliegt, einfach `portrait: ../../assets/… .jpg`
   im Frontmatter ergänzen (Astro-Bildoptimierung inklusive).

## Formular „Gast vorschlagen" anbinden

Das Formular unter `/gast-vorschlagen/` ist technisch vollständig vorbereitet
(Validierung, Erfolgs-/Fehlerzustand, Feld-Logik für „mich selbst vorschlagen"),
aber in V1 **nicht an ein Backend angebunden** — es gibt noch keinen Endpunkt.

Anbindung in `src/scripts/guest-form.ts`, Konstante `ENDPOINT`:

- **Formspree / ähnliche Form-as-a-Service-Anbieter**: Endpunkt-URL eintragen,
  fertig.
- **Netlify Forms** (bei Deployment auf Netlify): `data-netlify="true"` und ein
  verstecktes `form-name`-Feld zum `<form>` in
  `src/pages/gast-vorschlagen/index.astro` ergänzen; clientseitiges `fetch` kann
  dann entfallen, Netlify verarbeitet den nativen Form-POST.
- **Eigene API-Route**: erfordert einen SSR-fähigen Astro-Adapter (aktuell ist
  die Seite komplett statisch, `output: "static"`).

Der Newsletter (`Newsletter.astro`) ist nach demselben Muster vorbereitet, aber
noch ohne Anbieter.

## Plattform-Links / Social Accounts pflegen

Alle externen Links (YouTube, Spotify, Apple Podcasts, Instagram, TikTok, …)
sowie Projektname, Kontakt-E-Mail und Domain liegen ausschließlich in
`src/config/site.ts`. Solange ein Wert `null` ist, wird die jeweilige Kachel/der
Link im UI automatisch als „bald verfügbar" dargestellt statt verlinkt.

## Deployment

Statischer Build (`npm run build` → `dist/`), lauffähig auf Vercel, Netlify oder
jedem anderen Static-Hosting. Vor dem Go-Live:

- `astro.config.mjs` → `SITE_URL` und `src/config/site.ts` → `siteUrl` auf die
  finale Domain setzen (steuert Sitemap, Canonical-URLs, robots.txt).
- `public/og/default.svg` durch ein echtes PNG/JPG (1200×630) ersetzen — viele
  Plattformen (u.a. X/Twitter, teils Facebook) rendern SVG-`og:image`s nicht
  zuverlässig.
