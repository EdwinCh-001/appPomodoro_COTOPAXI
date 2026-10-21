import {
  DEFAULT_SETTINGS,
  RANGES,
  parseSettingsInput,
  settingsToInput,
  validateSettings,
} from '../settings';

describe('defaults y rangos', () => {
  it('usa 25/5/15/4 por defecto (pomodoro-rules)', () => {
    expect(DEFAULT_SETTINGS).toEqual({
      studyMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      pomodorosPerCycle: 4,
    });
  });

  it('define los rangos con estudio 1–60 (enmienda del 2026-10-19)', () => {
    expect(RANGES.studyMinutes).toEqual([1, 60]);
    expect(RANGES.shortBreakMinutes).toEqual([1, 30]);
    expect(RANGES.longBreakMinutes).toEqual([1, 60]);
    expect(RANGES.pomodorosPerCycle).toEqual([1, 10]);
  });

  it('convierte los defaults a texto para refrescar el formulario', () => {
    expect(settingsToInput(DEFAULT_SETTINGS)).toEqual({
      studyMinutes: '25',
      shortBreakMinutes: '5',
      longBreakMinutes: '15',
      pomodorosPerCycle: '4',
    });
  });
});

describe('value from text', () => {
  it('convierte texto numérico a número', () => {
    expect(parseSettingsInput('25')).toBe(25);
    expect(parseSettingsInput(' 12 ')).toBe(12);
  });

  it('rechaza vacío, decimales, negativos y no numéricos', () => {
    expect(parseSettingsInput('')).toBeNull();
    expect(parseSettingsInput('   ')).toBeNull();
    expect(parseSettingsInput('25.5')).toBeNull();
    expect(parseSettingsInput('-1')).toBeNull();
    expect(parseSettingsInput('abc')).toBeNull();
  });
});

describe('validateSettings', () => {
  const valid = {
    studyMinutes: '25',
    shortBreakMinutes: '5',
    longBreakMinutes: '15',
    pomodorosPerCycle: '4',
  };

  it('acepta valores válidos y los devuelve como números', () => {
    const result = validateSettings(valid);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.settings).toEqual(DEFAULT_SETTINGS);
    }
  });

  it('acepta los límites exactos de cada rango', () => {
    const result = validateSettings({
      studyMinutes: '60',
      shortBreakMinutes: '30',
      longBreakMinutes: '60',
      pomodorosPerCycle: '10',
    });

    expect(result.ok).toBe(true);
  });

  it('acepta el mínimo exacto de cada rango', () => {
    const result = validateSettings({
      studyMinutes: '1',
      shortBreakMinutes: '1',
      longBreakMinutes: '1',
      pomodorosPerCycle: '1',
    });

    expect(result.ok).toBe(true);
  });

  it('rechaza campos vacíos con un mensaje por campo', () => {
    const result = validateSettings({ ...valid, studyMinutes: '' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.studyMinutes).toBeDefined();
      expect(result.errors.studyMinutes).toContain('1');
    }
  });

  it('rechaza cero, negativos, decimales y no numéricos', () => {
    const result = validateSettings({
      studyMinutes: '0',
      shortBreakMinutes: '-5',
      longBreakMinutes: '15.5',
      pomodorosPerCycle: 'muchos',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(
        ['longBreakMinutes', 'pomodorosPerCycle', 'shortBreakMinutes', 'studyMinutes'],
      );
    }
  });

  it('rechaza valores fuera de rango indicando el máximo', () => {
    const result = validateSettings({ ...valid, studyMinutes: '61' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.studyMinutes).toContain('60');
    }
  });

  it('rechaza un descanso corto fuera de su rango propio (1–30)', () => {
    const result = validateSettings({ ...valid, shortBreakMinutes: '31' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.shortBreakMinutes).toContain('30');
    }
  });

  it('mantiene los mensajes en español y sin depender solo del color', () => {
    const result = validateSettings({ ...valid, studyMinutes: '' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.studyMinutes).toMatch(/número|minutos/i);
    }
  });
});
