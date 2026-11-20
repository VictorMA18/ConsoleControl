import { CloudCheck, CloudOff, CloudUpload, RefreshCw, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { indicatorState, type SyncIndicatorState, useSyncStore } from '../stores/syncStore';
import { cn } from '../utils/cn';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

const LOOK: Record<SyncIndicatorState, { icon: LucideIcon; tone: string; soft: string }> = {
  sin_conexion: { icon: CloudOff, tone: 'text-muted-foreground', soft: 'bg-secondary' },
  sin_configurar: { icon: CloudOff, tone: 'text-muted-foreground', soft: 'bg-secondary' },
  sincronizando: { icon: RefreshCw, tone: 'text-pending-tone', soft: 'bg-pending-soft' },
  pendiente: { icon: CloudUpload, tone: 'text-warning-tone', soft: 'bg-warning-soft' },
  actualizada: { icon: CloudCheck, tone: 'text-available-tone', soft: 'bg-available-soft' },
};

function label(state: SyncIndicatorState, pending: number): string {
  switch (state) {
    case 'sin_conexion':
      return 'Sin conexión';
    case 'sin_configurar':
      return 'Sin nube';
    case 'sincronizando':
      return 'Subiendo…';
    case 'pendiente':
      return `Pendiente (${pending})`;
    case 'actualizada':
      return 'Nube al día';
  }
}

// Indicador de la cabecera del muro (HU-008b): sin conexión, pendiente con N registros o nube
// actualizada. Solo lee el store; la sincronización corre aparte (src/sync/connectivity.ts).
export function SyncIndicator() {
  const online = useSyncStore((s) => s.online);
  const syncing = useSyncStore((s) => s.syncing);
  const pending = useSyncStore((s) => s.pending);
  const configured = useSyncStore((s) => s.configured);
  const state = indicatorState({ online, syncing, pending, configured });
  const look = LOOK[state];
  const text = label(state, pending);
  return (
    <View
      testID="indicador-nube"
      accessible
      accessibilityLabel={`Respaldo en la nube: ${text}`}
      className={cn('flex-row items-center gap-1.5 rounded-full px-3 py-1.5', look.soft)}
    >
      <Icon as={look.icon} size={15} strokeWidth={2.25} className={look.tone} />
      <Text className={cn('text-xs font-bold', look.tone)}>{text}</Text>
    </View>
  );
}
