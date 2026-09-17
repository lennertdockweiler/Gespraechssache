// Zentrale Stelle für interne, base-path-bewusste Links.
//
// GitHub Pages liefert dieses Projekt unter einem Unterpfad aus
// (https://<user>.github.io/<repo>/), nicht unter der Domain-Root. Astro
// kennt diesen Pfad über `base` in astro.config.mjs und stellt ihn zur
// Laufzeit über `import.meta.env.BASE_URL` bereit (immer mit
// abschließendem Slash normalisiert).
//
// `withBase()` hängt jeden root-relativen internen Pfad ("/gespraeche/")
// korrekt an diesen Unterpfad an. Wird der Standort später auf eine
// eigene Domain (Vercel/Netlify/Custom Domain) umgezogen, bleibt dieser
// Helfer unschädlich: ohne konfigurierten `base` liefert er die Pfade
// unverändert zurück.
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL; // z.B. "/" oder "/Gespr-chssache/"
  if (path === '/') return base;
  return base + path.replace(/^\//, '');
}
