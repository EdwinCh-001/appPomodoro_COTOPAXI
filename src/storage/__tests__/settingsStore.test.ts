import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SETTINGS_STORAGE_KEY,
  loadSettings,
  resetSettings,
  saveSettings,
} from '../settingsStore';
import { DEFAULT_SETTINGS } from '@/domain/settings';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

const storage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

const CUSTOM = {
  studyMinutes: 50,
  shortBreakMinutes: 8,
  longBreakMinutes: 20,
  pomodorosPerCycle: 3,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('saveSettings', () => {
  it('escribe los ajustes serializados en la clave propia', async () => {
    storage.setItem.mockResolvedValue(undefined);

    await saveSettings(CUSTOM);

    expect(storage.setItem).toHaveBeenCalledWith(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(CUSTOM),
    );
  });

  it('propaga los fallos de escritura para no indicar un guardado falso', async () => {
    const error = new Error('sin espacio');
    storage.setItem.mockRejectedValue(error);

    await expect(saveSettings(CUSTOM)).rejects.toBe(error);
  });
});

describe('loadSettings', () => {
  it('devuelve los ajustes guardados idénticos (guardar → cargar)', async () => {
    storage.getItem.mockResolvedValue(JSON.stringify(CUSTOM));

    await expect(loadSettings()).resolves.toEqual(CUSTOM);
  });

  it('devuelve los valores por defecto si no hay nada guardado (RF-7)', async () => {
    storage.getItem.mockResolvedValue(null);

    await expect(loadSettings()).resolves.toEqual(DEFAULT_SETTINGS);
  });

  it('devuelve los valores por defecto ante JSON corrupto, sin lanzar', async () => {
    storage.getItem.mockResolvedValue('{ roto');

    await expect(loadSettings()).resolves.toEqual(DEFAULT_SETTINGS);
  });

  it('devuelve los valores por defecto si el almacenamiento falla', async () => {
    storage.getItem.mockRejectedValue(new Error('sin espacio'));

    await expect(loadSettings()).resolves.toEqual(DEFAULT_SETTINGS);
  });

  it('descarta ajustes fuera de rango y usa los por defecto (RF-2)', async () => {
    storage.getItem.mockResolvedValue(
      JSON.stringify({ ...CUSTOM, studyMinutes: 999 }),
    );

    await expect(loadSettings()).resolves.toEqual(DEFAULT_SETTINGS);
  });

  it('descarta ajustes con forma incompleta', async () => {
    storage.getItem.mockResolvedValue(JSON.stringify({ studyMinutes: 50 }));

    await expect(loadSettings()).resolves.toEqual(DEFAULT_SETTINGS);
  });
});

describe('resetSettings', () => {
  it('guarda los valores por defecto y los devuelve (RF-4)', async () => {
    storage.setItem.mockResolvedValue(undefined);

    await expect(resetSettings()).resolves.toEqual(DEFAULT_SETTINGS);
    expect(storage.setItem).toHaveBeenCalledWith(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(DEFAULT_SETTINGS),
    );
  });

  it('propaga el fallo de escritura para poder revertir', async () => {
    const error = new Error('sin espacio');
    storage.setItem.mockRejectedValue(error);

    await expect(resetSettings()).rejects.toBe(error);
  });
});
