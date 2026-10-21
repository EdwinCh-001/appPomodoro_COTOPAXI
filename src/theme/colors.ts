/**
 * Paleta institucional de la Academia Cotopaxi (skill `cotopaxi-brand`).
 * Única fuente de colores de la interfaz: no usar literales sueltos
 * en los componentes.
 */
export const palette = {
  /** Encabezado y barra superior. */
  header: '#001F3F',
  /** Texto sobre fondos oscuros. */
  onDark: '#FFFFFF',
  /** Botón primario. */
  primary: '#357CA5',
  /** Acción destructiva (reiniciar/alerta). */
  danger: '#D33724',
  /** Estado de pausa / descanso. */
  pause: '#5AC594',
  /** Texto sobre el color de pausa. */
  onPause: '#111111',
  /** Fondo de pantalla. */
  background: '#E2E4E9',
  /** Tarjetas y campos. */
  surface: '#FFFFFF',
  /** Texto principal sobre fondos claros. */
  text: '#111111',
  /** Texto secundario sobre blanco. */
  textMuted: '#5A6E82',
  /** Bordes e inactivos. Nunca como color de texto. */
  border: '#B5BBC8',
} as const;
