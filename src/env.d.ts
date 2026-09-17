/// <reference types="astro/client" />

// Zusätzliche Environment-Variablen für die offiziellen YouTube-/
// Instagram-Integrationen (siehe src/lib/youtube.ts, src/lib/instagram.ts
// und .env.example). Werden ausschließlich serverseitig zur Build-Zeit
// gelesen (Astro-Frontmatter, keine <script>-Blöcke) und landen dadurch
// nie im Client-Bundle.
interface ImportMetaEnv {
  readonly YOUTUBE_API_KEY?: string;
  readonly YOUTUBE_CHANNEL_ID?: string;
  readonly INSTAGRAM_ACCESS_TOKEN?: string;
  readonly INSTAGRAM_USER_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
