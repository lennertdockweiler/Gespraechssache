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

## Wie neue Gespräche auf die Website kommen

`/gespraeche/` wird **automatisch** aus den neuesten Uploads des in
`YOUTUBE_CHANNEL_ID_MAIN` konfigurierten YouTube-Kanals befüllt (siehe
`src/lib/gespraeche.ts`) — ein neu hochgeladenes Video erscheint dort ohne
jedes weitere Zutun, spätestens nach dem nächsten (stündlichen) Rebuild,
zunächst mit Titel/Beschreibung/Datum/Thumbnail direkt von YouTube.

Redaktionelle Dateien in `src/content/episodes/*.md` sind **optional** und
reichern ein bereits automatisch erschienenes Video nachträglich an
(Kategorie, Gast-Verknüpfung, Kapitel, Zitate, ausführlicher Text, Podcast-
Links). Eine Episode wird über ihre `youtubeCut`- oder `youtubeFull`-URL mit
dem passenden Video verknüpft — steht dort dieselbe Video-ID wie in einem
automatisch geladenen Upload, übernimmt die redaktionelle Datei die
Anzeige komplett (Auto-Version verschwindet, die kuratierte Version bleibt
unter derselben URL).

So legst du eine redaktionelle Anreicherung an:

1. Datei anlegen: `src/content/episodes/mein-slug.md` (Dateiname = Slug =
   spätere URL `/gespraeche/mein-slug/` — **weicht damit von der
   automatischen `/gespraeche/<videoId>/`-URL ab**; wurde das Video vorher
   schon automatisch gelistet, ändert sich seine URL beim Anlegen der
   redaktionellen Datei).
2. Frontmatter ausfüllen (siehe `episode-001.md` als Vorlage), insbesondere
   `guest` (Slug einer Person aus `src/content/people/`) und `youtubeCut`/
   `youtubeFull` mit der echten YouTube-URL des Videos.
3. `placeholder: false` setzen, sobald es sich um ein echtes, veröffentlichtes
   Gespräch handelt (steuert u.a., ob VideoObject-Structured-Data ausgegeben
   wird).
4. Fertig — erscheint automatisch in `/gespraeche/`, in der Filterliste, auf
   der Personenseite des Gasts und ggf. als „Neuestes Gespräch" auf der
   Startseite (bei `featured: true`).

Ohne jede redaktionelle Datei funktioniert `/gespraeche/` ebenfalls — dann
zeigt jede Seite eben nur das, was YouTube liefert (kein Gast, keine
Kategorie, kein Podcast-Link), statt einer vollen Magazin-Aufbereitung.

### Zweiter Bereich: „Ganze Gespräche" (Uncut-Kanal)

`/ganze-gespraeche/` ist ein bewusst einfacher, zweiter Bereich für den
separaten YouTube-Kanal mit den vollständigen, ungeschnittenen Gesprächen
(`YOUTUBE_CHANNEL_ID_UNCUT`). Funktioniert nach demselben Automatik-Prinzip
wie `/gespraeche/` (neues Video → erscheint automatisch), aber **ohne**
redaktionelle Anreicherung und **ohne** automatische Verknüpfung zu einer
Best-of-Version auf dem Hauptkanal — das wäre ohne verlässlichen
gemeinsamen Schlüssel zwischen beiden Kanälen zu fehleranfällig
(Verwechslungsgefahr).

Der Fokus der Website bleibt bewusst auf `/gespraeche/`: „Ganze Gespräche"
taucht nicht in der Hauptnavigation auf, nur im Footer sowie als dezenter
Link am Ende der Gespräche-Übersicht. Wer eine einzelne Best-of-Episode
manuell mit ihrer Uncut-Version verlinken möchte, trägt deren URL wie
gehabt im `youtubeFull`-Feld der redaktionellen Episoden-Datei ein (siehe
oben) — das war schon vorher möglich und bleibt der einzige Verknüpfungsweg.

## Neuen Gast hinzufügen

1. Datei anlegen: `src/content/people/vorname-nachname.md` (Dateiname = Slug =
   spätere URL `/menschen/vorname-nachname/`).
2. Frontmatter ausfüllen. `portrait` kann vorerst weggelassen werden — ohne Bild
   wird automatisch ein hochwertiger typografischer Platzhalter angezeigt
   (`PlaceholderVisual.astro`).
3. Sobald ein echtes Portrait vorliegt, einfach `portrait: ../../assets/… .jpg`
   im Frontmatter ergänzen (Astro-Bildoptimierung inklusive).

## Formular „Gast vorschlagen" anbinden

Das Formular unter `/gast-vorschlagen/` versendet über **Formspree**
(https://formspree.io) — ein reiner Form-as-a-Service-Anbieter, der ohne
eigenen Server mit GitHub Pages funktioniert. Logik in
`src/scripts/guest-form.ts`, Endpunkt kommt aus der Environment-Variable
`PUBLIC_FORMSPREE_ENDPOINT` (siehe `.env.example`). Fehlt sie, bleibt das
Formular wie zuvor unverdrahtet und kommuniziert das transparent, statt
einen Fehler zu zeigen.

Einrichtung:

1. Kostenloses Konto auf https://formspree.io anlegen.
2. Neues Formular erstellen (z.B. „Gesprächssache – Gast vorschlagen").
3. Die dort angezeigte Endpunkt-URL (`https://formspree.io/f/xxxxxxxx`) als
   Repository-Secret `PUBLIC_FORMSPREE_ENDPOINT` in GitHub hinterlegen
   (Settings → Secrets and variables → Actions) und für lokale Entwicklung
   in `.env` eintragen.
4. Formspree sendet eingehende Vorschläge standardmäßig per E-Mail an die
   beim Konto hinterlegte Adresse — dort ggf. Benachrichtigungen/Weiterleitung
   einrichten.

Der Newsletter (`Newsletter.astro`) ist nach demselben Muster vorbereitet, aber
noch ohne Anbieter — dafür wurde bewusst noch kein Dienst festgelegt.

## YouTube- und Instagram-Integration

Zwei zusätzliche Bereiche laden automatisch Inhalte von den offiziellen
APIs von YouTube und Instagram – und rendern einfach nichts (bzw. fallen
auf rein redaktionelle Inhalte zurück), solange die zugehörigen
Environment-Variablen fehlen:

- **`/gespraeche/`** (Startseite + Übersicht + Detailseiten): neueste
  Video-Uploads über die offizielle **YouTube Data API v3**, siehe
  vorherigen Abschnitt „Wie neue Gespräche auf die Website kommen". Logik
  in `src/lib/youtube.ts` (Abruf) und `src/lib/gespraeche.ts`
  (Zusammenführung mit redaktionellen Episoden). Darstellung u.a. über
  `src/components/YouTubePlayer.astro` (Lazy-Load-Facade, echter Embed
  erst bei Klick, über die datenschutzfreundlichere Domain
  `youtube-nocookie.com`).
- **„Gedanken & Begegnungen"** (Startseite): neueste Beiträge über die
  offizielle **Instagram API with Instagram Login** (Meta Graph API,
  erfordert einen Instagram Business-/Creator-Account). Logik in
  `src/lib/instagram.ts`, Darstellung in
  `src/components/InstagramFeed.astro` (eigene Kachel-Optik, kein
  Standard-Widget; Klick öffnet den Originalbeitrag auf instagram.com).

Beide Module rufen ihre API **ausschließlich zur Build-Zeit** auf (aus
Astro-Frontmatter, nie aus Client-JavaScript) – bei einem rein statischen
Deployment ohne Serverlaufzeit ist das der Weg, um Requests serverseitig zu
halten und den API-Key/Token niemals ins Client-Bundle zu geben. Weil ein
Seitenaufruf im Browser nie einen API-Request auslöst, übernimmt der
`schedule`-Trigger in `.github/workflows/deploy.yml` (stündlicher Rebuild)
die Rolle der serverseitigen Cache-Revalidation.

Benötigte Environment-Variablen: siehe `.env.example`. Für lokale
Entwicklung in `.env` eintragen; für das GitHub-Pages-Deployment als
Repository-Secrets hinterlegen (Settings → Secrets and variables →
Actions), niemals in `.env.example` oder eine andere committete Datei.

Bekannte Einschränkung: Instagrams `media_url` ist eine befristete,
signierte CDN-URL. Sie wird bei jedem (geplanten) Rebuild frisch geladen
und nicht dauerhaft gespeichert/rehostet – bleibt die Seite sehr lange
ungebaut, kann ein einzelnes Bild bis zum nächsten Rebuild veraltet sein.

### Instagram-Token automatisch erneuern

`.github/workflows/refresh-instagram-token.yml` ruft alle 5 Tage
automatisch den offiziellen Refresh-Endpunkt auf und aktualisiert das
Repository-Secret `INSTAGRAM_ACCESS_TOKEN` mit dem neuen, wieder 60 Tage
gültigen Token — ohne dass du manuell etwas tun musst, sobald einmal
eingerichtet.

Dafür braucht der Workflow einen zusätzlichen, eigenen Token mit
Schreibrecht auf Secrets dieses Repositories (der von GitHub Actions
automatisch bereitgestellte `GITHUB_TOKEN` darf das nicht). Einrichtung:

1. GitHub → Settings (deines Accounts, nicht des Repos) → Developer settings
   → Fine-grained tokens → „Generate new token".
2. Zugriff **nur** auf dieses eine Repository (`Gespraechssache`)
   beschränken.
3. Unter „Permissions" **nur** `Secrets` → `Read and write` aktivieren —
   sonst nichts. So bleibt der Schaden im Fall eines Leaks minimal.
4. Den erzeugten Token als Repository-Secret `GH_PAT_SECRETS_WRITE`
   hinterlegen (Settings → Secrets and variables → Actions).

Ohne dieses Secret überspringt der Workflow sich selbst (kein Fehler, siehe
Skript) — die Instagram-Integration funktioniert dann trotzdem weiter, bis
das ursprüngliche Token nach 60 Tagen abläuft und manuell erneuert werden
müsste.

## Redaktion (CMS)

Für Menschen und Kurz-gefragt-Clips (die keine externe Datenquelle wie
YouTube haben) gibt es unter **`/admin/`** eine Editier-Oberfläche:
[Sveltia CMS](https://github.com/sveltia/sveltia-cms), ein modernes,
git-basiertes CMS. Es bearbeitet exakt dieselben Markdown-Dateien in
`src/content/`, committet Änderungen direkt in dieses Repository (löst
dadurch automatisch den bestehenden Deploy-Workflow aus) und braucht keine
eigene Datenbank. Die Konfiguration liegt in `public/admin/config.yml` und
bildet die drei Content-Collections (`people`, `episodes`,
`streetInterviews`) sowie deren Schemas aus `src/content/config.ts` ab.

Auch **Gespräche** lassen sich dort redaktionell anreichern (siehe „Wie
neue Gespräche auf die Website kommen" oben) — die automatische
YouTube-Befüllung bleibt davon unberührt.

### Anmeldung

Da ausschließlich du selbst das CMS bedienst, meldet sich Sveltia CMS
direkt über einen persönlichen **GitHub Personal Access Token (PAT)** an,
den du im Login-Bildschirm von `/admin/` einfügst — ohne OAuth-App oder
zusätzlichen Cloudflare-Worker (dafür fehlt in `public/admin/config.yml`
bewusst ein `base_url`-Eintrag unter `backend`, das ist kein Fehler,
sondern schaltet genau diesen Login-Modus ein).

Einrichtung des PAT (einmalig, danach im Browser gespeichert):

1. GitHub → Settings (deines Accounts) → Developer settings →
   Fine-grained tokens → „Generate new token".
2. Zugriff **nur** auf dieses eine Repository (`Gespraechssache`)
   beschränken.
3. Unter „Permissions" **nur** `Contents` → `Read and write` aktivieren.
4. Token beim Öffnen von `/admin/` in den Login-Bildschirm einfügen — nicht
   als Repository-Secret hinterlegen (er ist nur für dich persönlich, im
   Browser gespeichert, bestimmt für manuelles Bedienen, kein
   Build-/Deploy-Vorgang braucht ihn).

Läuft der PAT irgendwann ab oder wird widerrufen, einfach einen neuen
erzeugen und beim nächsten `/admin/`-Login eintragen.
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
