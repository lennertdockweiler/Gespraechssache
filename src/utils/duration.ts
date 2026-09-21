// Wandelt die redaktionell gepflegten, menschenlesbaren Dauer-Strings
// ("2:05:00", "32:40", siehe content/config.ts) in ISO-8601-Dauer um
// (z.B. "PT2H5M0S") – das von schema.org/VideoObject erwartete Format für
// die `duration`-Property.
export function toIso8601Duration(hms: string): string | undefined {
  const parts = hms.split(':').map((part) => Number.parseInt(part, 10));
  if (parts.some((part) => Number.isNaN(part))) return undefined;

  const [hours, minutes, seconds] =
    parts.length === 3 ? parts : parts.length === 2 ? [0, parts[0], parts[1]] : [0, 0, parts[0]];

  let duration = 'PT';
  if (hours) duration += `${hours}H`;
  if (minutes) duration += `${minutes}M`;
  if (seconds || (!hours && !minutes)) duration += `${seconds}S`;
  return duration;
}
