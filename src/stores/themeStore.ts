import Storage from 'expo-sqlite/kv-store';
import { colorScheme } from 'nativewind';
import { create } from 'zustand';

// Tema elegido por quien atiende: el del celular (por defecto), claro u oscuro. Se guarda en el
// almacén clave-valor de expo-sqlite para que sobreviva al reinicio (ADR 0014).
export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'preferencia-tema';
const PREFERENCES: ThemePreference[] = ['system', 'light', 'dark'];

function readSaved(): ThemePreference {
  try {
    const saved = Storage.getItemSync(STORAGE_KEY);
    return PREFERENCES.includes(saved as ThemePreference) ? (saved as ThemePreference) : 'system';
  } catch {
    // Sin almacén (por ejemplo, en las pruebas) se sigue el tema del sistema.
    return 'system';
  }
}

type ThemeState = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  preference: readSaved(),
  setPreference: (preference) => {
    colorScheme.set(preference);
    try {
      Storage.setItemSync(STORAGE_KEY, preference);
    } catch {
      // Si no se puede guardar, el cambio vale solo hasta cerrar la app.
    }
    set({ preference });
  },
}));

// Aplica el tema guardado al abrir la app (app/_layout.tsx).
export function applySavedTheme(): void {
  colorScheme.set(useThemeStore.getState().preference);
}
