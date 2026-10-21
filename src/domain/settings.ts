/**
 * Ajustes del Pomodoro — validación pura (HU-005).
 *
 * Valores por defecto, rangos permitidos y validación de las entradas del
 * formulario. Sin React ni AsyncStorage (Constitución #5): la interfaz
 * solo muestra los mensajes que devuelve esta capa.
 */

/** Ajustes en minutos enteros más los pomodoros del ciclo. */
export interface Settings {
  studyMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  pomodorosPerCycle: number;
}

/** Campos numéricos tal y como llegan del formulario (texto). */
export interface SettingsInput {
  studyMinutes: string;
  shortBreakMinutes: string;
  longBreakMinutes: string;
  pomodorosPerCycle: string;
}

/** Claves de los ajustes, para recorrerlas sin repetir literales. */
export type SettingsField = keyof Settings;

/**
 * Valores por defecto (skill `pomodoro-rules`): 25/5/15/4 (RF-7).
 */
export const DEFAULT_SETTINGS: Settings = {
  studyMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  pomodorosPerCycle: 4,
};

/**
 * Rangos permitidos, constante única (RF-2). El estudio es 1–60 según la
 * enmienda del usuario del 2026-10-19 (alineada con `pomodoro-rules`).
 */
export const RANGES: Record<SettingsField, readonly [number, number]> = {
  studyMinutes: [1, 60],
  shortBreakMinutes: [1, 30],
  longBreakMinutes: [1, 60],
  pomodorosPerCycle: [1, 10],
};

/** Etiquetas en español de cada campo, con la unidad para los mensajes. */
const FIELD_LABELS: Record<SettingsField, string> = {
  studyMinutes: 'minutos de estudio',
  shortBreakMinutes: 'minutos de descanso corto',
  longBreakMinutes: 'minutos de descanso largo',
  pomodorosPerCycle: 'pomodoros por ciclo',
};

/**
 * Convierte el texto del formulario a entero, o `null` si no es un entero
 * válido: vacío, con espacios internos, decimal, negativo o no numérico
 * (RF-3). Los espacios alrededor se toleran.
 */
export function parseSettingsInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return null;
  }
  // Solo dígitos: descarta decimales, signos y notación científica.
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }
  return Number.parseInt(trimmed, 10);
}

/** Resultado de la validación: válida con ajustes, o inválida con errores. */
export type ValidationResult =
  | { ok: true; settings: Settings }
  | { ok: false; errors: Partial<Record<SettingsField, string>> };

/**
 * Valida el formulario completo y devuelve los ajustes ya numéricos
 * (RF-2, RF-3). Si un solo campo falla, no se guarda **nada**: la interfaz
 * recibe un mensaje en español por cada campo inválido.
 */
export function validateSettings(input: SettingsInput): ValidationResult {
  const errors: Partial<Record<SettingsField, string>> = {};
  const parsed: Partial<Settings> = {};

  (Object.keys(RANGES) as SettingsField[]).forEach((field) => {
    const [min, max] = RANGES[field];
    const value = parseSettingsInput(input[field]);

    if (value === null) {
      errors[field] = `Ingresa un número entero de ${FIELD_LABELS[field]} entre ${min} y ${max}.`;
      return;
    }
    if (value < min || value > max) {
      errors[field] = `Ingresa un número entre ${min} y ${max} para ${FIELD_LABELS[field]}.`;
      return;
    }
    parsed[field] = value;
  });

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, settings: parsed as Settings };
}

/** Comprueba que un valor desconocido tenga la forma de `Settings`. */
export function isSettings(value: unknown): value is Settings {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (Object.keys(RANGES) as SettingsField[]).every((field) => {
    const raw = candidate[field];
    if (typeof raw !== 'number' || !Number.isInteger(raw)) {
      return false;
    }
    const [min, max] = RANGES[field];
    return raw >= min && raw <= max;
  });
}

/** Convierte ajustes a texto para precargar el formulario. */
export function settingsToInput(settings: Settings): SettingsInput {
  return {
    studyMinutes: String(settings.studyMinutes),
    shortBreakMinutes: String(settings.shortBreakMinutes),
    longBreakMinutes: String(settings.longBreakMinutes),
    pomodorosPerCycle: String(settings.pomodorosPerCycle),
  };
}

/**
 * Duraciones del ciclo en segundos a partir de los ajustes. Es el puente
 * hacia las specs 001–003 (IT-1: el dominio trabaja en segundos).
 */
export function settingsToDurations(settings: Settings): {
  study: number;
  shortBreak: number;
  longBreak: number;
} {
  return {
    study: settings.studyMinutes * 60,
    shortBreak: settings.shortBreakMinutes * 60,
    longBreak: settings.longBreakMinutes * 60,
  };
}
