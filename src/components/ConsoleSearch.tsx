import { useWallFilterStore } from '../stores/wallFilterStore';
import { SearchField } from './SearchField';

// Buscador del muro por identificador de máquina ("MAQ #3" o solo "3").
export function ConsoleSearch() {
  const query = useWallFilterStore((s) => s.query);
  const setQuery = useWallFilterStore((s) => s.setQuery);
  return (
    <SearchField
      testID="buscar-maquina"
      accessibilityLabel="Buscar máquina"
      value={query}
      onChangeText={setQuery}
      placeholder="Buscar máquina, por ejemplo 3"
    />
  );
}
