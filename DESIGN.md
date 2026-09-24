# Gesprächssache – Design-System-Referenz

Maschinenlesbare Zusammenfassung des visuellen Systems dieser Website, für
Menschen und KI-Modelle gleichermaßen gedacht. Einzige Quelle der Wahrheit
sind die CSS-Custom-Properties in `src/styles/global.css` und
`tailwind.config.mjs` – diese Datei ist eine Kopie zum schnellen
Nachschlagen und kann veralten; im Zweifel gilt der Code.

## Farben

| Token | Hex | Verwendung |
|---|---|---|
| `--color-paper` | `#f6f2ea` | Haupt-Hintergrund (warmes Papierweiß) |
| `--color-paper-soft` | `#efe9dd` | Sekundärer Hintergrund (Karten, alternierende Sektionen) |
| `--color-ink` | `#18140f` | Haupttextfarbe, dunkle Flächen (Header/Footer/Hero) |
| `--color-ink-soft` | `#2b241d` | Abgeschwächtes Schwarz (z.B. Zitat-Text) |
| `--color-stone` | `#635a4a` | Sekundärer Fließtext |
| `--color-stone-light` | `#a89d8c` | Nur dekorativ (SVG-Linien in Platzhaltergrafiken), NICHT für Lesetext (Kontrast zu gering) |
| `--color-sand` | `#e3d9c4` | Platzhalter-Flächen |
| `--color-accent` (Petrol) | `#35615d` | Marken-/Akzentfarbe: Links, aktive Nav, CTAs, Fokus-Ring |
| `--color-accent-soft` | `#7fa39f` | Helleres Petrol: Hover-Zustände, sekundäre Akzente |
| `--color-line` | `#ded3bd` | Rahmen/Trennlinien |
| `--color-petrol-wash` | `#ccd2cb` | Sehr helle Petrol-Fläche (Sektion „Kurz gefragt") – aus Accent + Paper gemischt, kein eigenständiger Farbwert |
| `--color-petrol-wash-line` | `#b2bfb9` | Rahmen zur Petrol-Wash-Fläche |

**Dunkle Flächen** (Hero, Footer, mobiles Menü-Overlay) nutzen `--color-ink`
als Hintergrund mit `--color-paper`/`--color-accent-soft` als Text.

## Typografie

| Rolle | Font | Fallback-Stack | Einsatz |
|---|---|---|---|
| Serif (Display) | Fraunces Variable | Georgia, serif | Überschriften h1–h4, große Zitate |
| Sans (Body/UI) | Inter Variable | system-ui, sans-serif | Fließtext, Buttons, Navigation |
| Mono (Label) | JetBrains Mono | ui-monospace, monospace | Eyebrows/Labels in Großbuchstaben, Episoden-Nummern, Timecodes |

Beide Variable Fonts (Fraunces, Inter) sind selbst gehostet (`@fontsource-variable`)
– **nicht** über Googles Server geladen, keine Datenübertragung an Google.

**Letter-Spacing-Tokens:** `widish` = `0.02em` (Navigation), `label` = `0.14em`
(Mono-Eyebrows in Großbuchstaben).

**Max-Breiten für Lesbarkeit:** `max-w-prose` = 68ch (Fließtext),
`max-w-content` = 1180px (Seiten-Container).

## Motion / Animation

| Token | Wert | Einsatz |
|---|---|---|
| `--ease-editorial` | `cubic-bezier(0.16, 1, 0.3, 1)` | Standard-Easing für praktisch alle Übergänge |
| `--dur-fast` | 350ms | Micro-Interactions (Buttons, Pfeile) |
| `--dur-base` | 600ms | Standard-Übergänge (Reveals, Farbwechsel) |
| `--dur-slow` | 900ms | Große, seltene Bewegungen (Zeilen-Reveal) |
| `--dur-snappy` | 220ms | Bewusst schnellere zweite Tempo-Stufe für „Kurz gefragt" |
| `--stagger-step` | 70ms | Versatz zwischen gleichzeitig erscheinenden Elementen (Karten, Nav-Items) |

Grundprinzip: nur `transform`/`opacity`/`clip-path` animieren, kein Layout-
Trashing. Alle Animationen respektieren `prefers-reduced-motion: reduce`.

## Abstände & Layout

- Tailwind-Standardskala (4px-Basis: `px-5`=20px, `py-16`=64px, `gap-8`=32px etc.), keine eigene Spacing-Skala definiert.
- Radius: durchgängig `rounded-lg`/`rounded-xl`/`rounded-full` (Tailwind-Standardwerte), kein eigener Radius-Token.
- Grid-Breakpoints folgen Tailwind-Standard (`sm`: 640px, `md`: 768px, `lg`: 1024px).
- Kartenraster: 1 Spalte mobil → 2 Spalten ab `sm` → 3 Spalten ab `lg` (Gespräche, Platzhalter-Grids).

## Ton & Stil (nicht-visuell, aber Teil des Systems)

- Redaktionell, ruhig, editoriell – keine Marketing-Übertreibung, keine Ausrufezeichen-Häufung.
- Deutsch, Sie/Du-Frage nicht relevant (Website duzt nicht explizit, bleibt neutral-persönlich: „Kennst du jemanden…").
- Bildsprache: keine Stock-Fotos/erfundene Personen – abstrakte, typografische Platzhalter bis echte Inhalte vorliegen.
