import { create } from 'zustand';

import type { ConsoleType } from '../db/schema/enums';

// Filtro del muro de consolas: solo estado de pantalla (ADR 0005).
type WallFilterState = {
  consoleType: ConsoleType | null;
  setConsoleType: (consoleType: ConsoleType | null) => void;
  // Texto del buscador: nombre o número de la máquina ("MAQ #3" o solo "3").
  query: string;
  setQuery: (query: string) => void;
};

export const useWallFilterStore = create<WallFilterState>((set) => ({
  consoleType: null,
  setConsoleType: (consoleType) => set({ consoleType }),
  query: '',
  setQuery: (query) => set({ query }),
}));

// ¿La consola coincide con lo buscado? Sin distinguir mayúsculas ni espacios; si solo se escriben
// números, se compara con el número de la máquina (3 encuentra "MAQ #3", no "MAQ #13").
export function matchesQuery(name: string, query: string): boolean {
  const wanted = query.trim().toLowerCase().replace(/\s+/g, '');
  if (wanted === '') {
    return true;
  }
  const normalized = name.toLowerCase().replace(/\s+/g, '');
  if (/^#?\d+$/.test(wanted)) {
    return normalized.match(/\d+/)?.[0] === wanted.replace('#', '');
  }
  return normalized.includes(wanted);
}
