/**
 * Pruebas de la lógica pura del aviso de fin de fase (spec 004, T2).
 *
 * Todo lo que decide *qué* se dice, *cuándo* pedir permiso y *cuándo*
 * sonar vive aquí y se prueba sin dispositivo (Constitución #5 y #6).
 */

import {
  ALARM_CHANNEL_ID,
  NOTICE_TITLES,
  alarmVibrationPattern,
  noticeContent,
  noticeIdFor,
  shouldAskPermission,
  shouldPlayInAppAlarm,
} from '../notice';

describe('noticeContent (RF-1, RNF-4)', () => {
  it('describe el fin del estudio y llama a iniciar el descanso corto', () => {
    const aviso = noticeContent('study');

    expect(aviso.title).toBe('¡Estudio terminado!');
    expect(aviso.body).toBe('Toca para iniciar el descanso corto.');
  });

  it('describe el fin del descanso corto y llama a volver al estudio', () => {
    const aviso = noticeContent('shortBreak');

    expect(aviso.title).toBe('¡Descanso corto terminado!');
    expect(aviso.body).toBe('Toca para volver al estudio.');
  });

  it('describe el fin del descanso largo y llama a volver al estudio', () => {
    const aviso = noticeContent('longBreak');

    expect(aviso.title).toBe('¡Descanso largo terminado!');
    expect(aviso.body).toBe('Toca para volver al estudio.');
  });

  it('identifica la fase terminada en el título (RF-1)', () => {
    expect(NOTICE_TITLES.study).toBe('¡Estudio terminado!');
    expect(NOTICE_TITLES.shortBreak).toBe('¡Descanso corto terminado!');
    expect(NOTICE_TITLES.longBreak).toBe('¡Descanso largo terminado!');
  });
});

describe('shouldAskPermission (RF-5, RNF-3)', () => {
  it('pide el permiso en el primer inicio si aún no se ha concedido', () => {
    expect(shouldAskPermission(true, 'undetermined')).toBe(true);
  });

  it('no vuelve a pedirlo tras denegar (solo se pide una vez)', () => {
    expect(shouldAskPermission(false, 'denied')).toBe(false);
  });

  it('no lo pide si ya está concedido', () => {
    expect(shouldAskPermission(true, 'granted')).toBe(false);
    expect(shouldAskPermission(false, 'granted')).toBe(false);
  });

  it('no lo pide en inicios posteriores al primero', () => {
    expect(shouldAskPermission(false, 'undetermined')).toBe(false);
  });
});

describe('shouldPlayInAppAlarm (RF-3, RF-4)', () => {
  it('suena solo con la app en primer plano y una fase recién terminada', () => {
    expect(shouldPlayInAppAlarm('active', true)).toBe(true);
  });

  it('no suena si la fase no terminó ahora', () => {
    expect(shouldPlayInAppAlarm('active', false)).toBe(false);
  });

  it('no suena con la app en segundo plano o inactiva', () => {
    expect(shouldPlayInAppAlarm('background', true)).toBe(false);
    expect(shouldPlayInAppAlarm('inactive', true)).toBe(false);
  });
});

describe('alarmVibrationPattern (RF-8)', () => {
  it('devuelve siempre el mismo patrón constante', () => {
    expect(alarmVibrationPattern()).toEqual(alarmVibrationPattern());
  });

  it('alterna espera y vibración, con al menos dos pulsos audibles', () => {
    const patron = alarmVibrationPattern();

    // Formato RN [espera, vibra, espera, vibra, ...]: los índices impares
    // son los tramos de vibración y deben ser mayores que cero.
    expect(patron.length).toBeGreaterThanOrEqual(4);
    for (let i = 1; i < patron.length; i += 2) {
      expect(patron[i]).toBeGreaterThan(0);
    }
  });
});

describe('noticeIdFor (RF-7)', () => {
  it('usa un id distinto por fase para poder cancelar la correcta', () => {
    const ids = [
      noticeIdFor('study'),
      noticeIdFor('shortBreak'),
      noticeIdFor('longBreak'),
    ];

    expect(new Set(ids).size).toBe(3);
  });

  it('es estable para la misma fase', () => {
    expect(noticeIdFor('study')).toBe(noticeIdFor('study'));
  });
});

describe('ALARM_CHANNEL_ID (RF-2, Android)', () => {
  it('define un canal propio, estable y no vacío', () => {
    expect(ALARM_CHANNEL_ID.length).toBeGreaterThan(0);
    expect(ALARM_CHANNEL_ID).toBe(ALARM_CHANNEL_ID.toLowerCase());
  });
});
