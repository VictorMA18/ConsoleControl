import { create } from 'zustand';

import type { ConsoleType } from '../db/schema/enums';

// Filtro del muro de consolas: solo estado de pantalla (ADR 0005).
type WallFilterState = {
  consoleType: ConsoleType | null;
  setConsoleType: (consoleType: ConsoleType | null) => void;
};

export const useWallFilterStore = create<WallFilterState>((set) => ({
  consoleType: null,
  setConsoleType: (consoleType) => set({ consoleType }),
}));
