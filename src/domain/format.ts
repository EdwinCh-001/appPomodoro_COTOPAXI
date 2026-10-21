/**
 * Formato del tiempo — función pura (HU-001).
 */

/**
 * Convierte segundos a `mm:ss` (RF-2). Ej: 1500 → "25:00".
 */
export function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}
