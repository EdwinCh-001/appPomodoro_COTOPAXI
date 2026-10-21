/**
 * Pruebas del almacén de la bandera de bienvenida (spec 006, T1).
 *
 * La bandera no contiene datos personales: solo recuerda si el estudiante
 * ya vio la bienvenida. Se prueba sin dispositivo (Constitución #6).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  WELCOME_STORAGE_KEY,
  hasSeenWelcome,
  markWelcomeSeen,
} from '../welcomeFlag';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

const storage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('WELCOME_STORAGE_KEY (RF-6)', () => {
  it('usa la clave aprobada en el inventario de datos', () => {
    expect(WELCOME_STORAGE_KEY).toBe('welcomeSeen');
  });
});

describe('hasSeenWelcome (RF-1, RF-9)', () => {
  it('devuelve false en una instalación nueva (sin dato guardado)', async () => {
    storage.getItem.mockResolvedValue(null);

    await expect(hasSeenWelcome()).resolves.toBe(false);
  });

  it('devuelve true cuando la bandera ya está marcada', async () => {
    storage.getItem.mockResolvedValue('true');

    await expect(hasSeenWelcome()).resolves.toBe(true);
  });

  it('devuelve false ante un valor corrupto o desconocido', async () => {
    storage.getItem.mockResolvedValue('quizá');

    await expect(hasSeenWelcome()).resolves.toBe(false);
  });

  it('devuelve false si el almacenamiento falla (nunca lanza)', async () => {
    storage.getItem.mockRejectedValue(new Error('sin almacenamiento'));

    await expect(hasSeenWelcome()).resolves.toBe(false);
  });
});

describe('markWelcomeSeen (RF-1, RF-9)', () => {
  it('marca la bandera en la clave única', async () => {
    storage.setItem.mockResolvedValue(undefined);

    await markWelcomeSeen();

    expect(storage.setItem).toHaveBeenCalledWith(WELCOME_STORAGE_KEY, 'true');
  });

  it('un fallo de escritura no se propaga', async () => {
    storage.setItem.mockRejectedValue(new Error('sin espacio'));

    await expect(markWelcomeSeen()).resolves.toBeUndefined();
  });
});
