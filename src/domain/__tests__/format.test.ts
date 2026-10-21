import { formatTime } from '../format';

describe('formatTime', () => {
  it('formatea minutos y segundos con dos dígitos', () => {
    expect(formatTime(1500)).toBe('25:00');
    expect(formatTime(59)).toBe('00:59');
    expect(formatTime(0)).toBe('00:00');
  });

  it('muestra 60:00 para una hora exacta (los ajustes permiten hasta 60 minutos)', () => {
    expect(formatTime(3600)).toBe('60:00');
  });

  it('formatea valores intermedios', () => {
    expect(formatTime(61)).toBe('01:01');
    expect(formatTime(9 * 60 + 5)).toBe('09:05');
    expect(formatTime(10 * 60)).toBe('10:00');
  });
});
