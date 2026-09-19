/// <reference types="astro/client" />

// Zusätzliche Environment-Variablen für die offiziellen YouTube-/
// Instagram-Integrationen (siehe src/lib/youtube.ts, src/lib/instagram.ts
// und .env.example). Werden ausschließlich serverseitig zur Build-Zeit
// gelesen (Astro-Frontmatter, keine <script>-Blöcke) und landen dadurch
// nie im Client-Bundle.
interface ImportMetaEnv {
  readonly YOUTUBE_API_KEY?: string;
  readonly YOUTUBE_CHANNEL_ID_MAIN?: string;
  readonly INSTAGRAM_ACCESS_TOKEN?: string;
  readonly INSTAGRAM_USER_ID?: string;
  // PUBLIC_-Präfix: von Astro/Vite bewusst ins Client-Bundle aufgenommen
  // (siehe src/scripts/guest-form.ts) – keine geheimen Zugangsdaten.
  readonly PUBLIC_FORMSPREE_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
