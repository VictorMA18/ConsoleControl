import { matchesQuery } from '../../src/stores/wallFilterStore';

describe('buscador de máquinas', () => {
  it('sin texto muestra todas', () => {
    expect(matchesQuery('MAQ #3', '  ')).toBe(true);
  });

  it('un número busca por el número de la máquina, no por parte de él', () => {
    expect(matchesQuery('MAQ #3', '3')).toBe(true);
    expect(matchesQuery('MAQ #13', '3')).toBe(false);
    expect(matchesQuery('MAQ #13', '#13')).toBe(true);
  });

  it('el texto busca sin distinguir mayúsculas ni espacios', () => {
    expect(matchesQuery('MAQ #3', 'maq#3')).toBe(true);
    expect(matchesQuery('MAQ #3', 'ps')).toBe(false);
  });
});
