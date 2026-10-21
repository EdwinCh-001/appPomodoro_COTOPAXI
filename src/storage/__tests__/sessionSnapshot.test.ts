import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SESSION_STORAGE_KEY,
  clearSnapshot,
  loadSnapshot,
  saveSnapshot,
} from '../sessionSnapshot';
import { DEFAULT_TARGET_POMODOROS, type SessionSnapshot } from '@/domain/reconcile';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

const storage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

const SNAPSHOT: SessionSnapshot = {
  schemaVersion: 1,
  phaseKind: 'study',
  status: 'running',
  endAt: 1_700_000_000_000,
  remainingSeconds: 900,
  completedPomodoros: 2,
  targetPomodoros: DEFAULT_TARGET_POMODOROS,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('saveSnapshot', () => {
  it('escribe el snapshot serializado en la clave única', async () => {
    storage.setItem.mockResolvedValue(undefined);

    await saveSnapshot(SNAPSHOT);

    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith(
      SESSION_STORAGE_KEY,
      JSON.stringify(SNAPSHOT),
    );
  });
});

describe('loadSnapshot', () => {
  it('devuelve el snapshot guardado idéntico (guardar → cargar)', async () => {
    storage.getItem.mockResolvedValue(JSON.stringify(SNAPSHOT));

    await expect(loadSnapshot()).resolves.toEqual(SNAPSHOT);
  });

  it('devuelve null cuando no hay nada guardado (primera ejecución)', async () => {
    storage.getItem.mockResolvedValue(null);

    await expect(loadSnapshot()).resolves.toBeNull();
  });

  it('devuelve null ante JSON corrupto, sin lanzar (RF-6)', async () => {
    storage.getItem.mockResolvedValue('{ esto no es json');

    await expect(loadSnapshot()).resolves.toBeNull();
  });

  it('devuelve null si el almacenamiento falla, sin lanzar (RF-6)', async () => {
    storage.getItem.mockRejectedValue(new Error('dispositivo sin espacio'));

    await expect(loadSnapshot()).resolves.toBeNull();
  });

  it('rechaza una versión de esquema desconocida (RF-8)', async () => {
    const futuro = { ...SNAPSHOT, schemaVersion: 99 };
    storage.getItem.mockResolvedValue(JSON.stringify(futuro));

    await expect(loadSnapshot()).resolves.toBeNull();
  });

  it('rechaza un JSON válido con forma incompleta (RF-6)', async () => {
    storage.getItem.mockResolvedValue(JSON.stringify({ schemaVersion: 1 }));

    await expect(loadSnapshot()).resolves.toBeNull();
  });

  it('rechaza valores de fase no reconocidos (RF-6)', async () => {
    const invalido = { ...SNAPSHOT, phaseKind: 'siesta' };
    storage.getItem.mockResolvedValue(JSON.stringify(invalido));

    await expect(loadSnapshot()).resolves.toBeNull();
  });

  it('acepta un snapshot antiguo sin el campo sessionEnded (compatible)', async () => {
    storage.getItem.mockResolvedValue(JSON.stringify(SNAPSHOT));

    await expect(loadSnapshot()).resolves.toEqual(SNAPSHOT);
  });

  it('conserva el estado de sesión terminada (guardar → cargar)', async () => {
    const terminada: SessionSnapshot = {
      ...SNAPSHOT,
      sessionEnded: true,
    };
    storage.getItem.mockResolvedValue(JSON.stringify(terminada));

    await expect(loadSnapshot()).resolves.toEqual(terminada);
  });
});

describe('clearSnapshot', () => {
  it('elimina la clave de sesión', async () => {
    storage.removeItem.mockResolvedValue(undefined);

    await clearSnapshot();

    expect(storage.removeItem).toHaveBeenCalledWith(SESSION_STORAGE_KEY);
  });
});
