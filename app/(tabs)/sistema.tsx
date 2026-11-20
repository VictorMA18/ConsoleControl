import { ChevronRight, Database, Info, Timer, type LucideIcon } from 'lucide-react-native';
import { type Href, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { PressableScale } from '../../src/components/PressableScale';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { Section } from '../../src/components/Section';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import { Icon } from '../../src/components/ui/icon';
import { Text } from '../../src/components/ui/text';
import { usePressOnce } from '../../src/hooks/usePressOnce';

// Configuración de la app (ADR 0014): apariencia y, mientras se desarrolla, las herramientas de
// prueba. Separada de Caja para que la caja solo trate de dinero.
export default function SystemScreen() {
  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Sistema" subtitle="Ajustes de la app" />
      <ScrollView contentContainerClassName="gap-4 p-4 pb-8">
        <Section title="Apariencia">
          <ThemeToggle />
          <Text className="text-sm text-muted-foreground">
            «Sistema» sigue el tema claro u oscuro del celular.
          </Text>
        </Section>

        {__DEV__ ? (
          <Section title="Herramientas de desarrollo">
            <ToolButton
              href="/dev/persistencia"
              icon={Database}
              title="Prueba de persistencia"
              hint="Crea sesiones de prueba y revisa SQLite"
            />
            <ToolButton
              href="/dev/spike-cronometro"
              icon={Timer}
              title="Spike del cronómetro"
              hint="Cronómetro con la app en segundo plano"
            />
          </Section>
        ) : null}

        <View className="flex-row items-center gap-3 px-1">
          <Icon as={Info} size={16} className="text-muted-foreground" />
          <Text className="text-sm text-muted-foreground">ConsoleControl Mobile · v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function ToolButton({
  href,
  icon,
  title,
  hint,
}: {
  href: Href;
  icon: LucideIcon;
  title: string;
  hint: string;
}) {
  const router = useRouter();
  const once = usePressOnce();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={once(() => router.push(href))}
      className="flex-row items-center gap-3 rounded-2xl border border-border bg-raised p-4"
    >
      <View className="h-11 w-11 items-center justify-center rounded-xl bg-secondary">
        <Icon as={icon} size={22} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold">{title}</Text>
        <Text className="text-sm text-muted-foreground">{hint}</Text>
      </View>
      <Icon as={ChevronRight} size={20} className="text-muted-foreground" />
    </PressableScale>
  );
}
