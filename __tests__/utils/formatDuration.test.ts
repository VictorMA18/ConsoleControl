import { formatDuration } from '../../src/utils/formatDuration';

describe('formatDuration', () => {
  it.each([
    [0, '00:00:00'],
    [999, '00:00:00'],
    [1000, '00:00:01'],
    [(65 * 60 + 9) * 1000, '01:05:09'],
    [(12 * 3600 + 34 * 60 + 56) * 1000, '12:34:56'],
    [-5000, '00:00:00'],
  ])('%i ms se muestra como %s', (ms, expected) => {
    expect(formatDuration(ms)).toBe(expected);
  });
});
