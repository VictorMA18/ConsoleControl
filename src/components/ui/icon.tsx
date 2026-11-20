// Componente de React Native Reusables (MIT), copiado a este repositorio. Ver ADR 0012.
import type { LucideIcon, LucideProps } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import * as React from 'react';

import { cn } from '../../utils/cn';
import { TextClassContext } from './text';

type IconProps = LucideProps & {
  as: LucideIcon;
} & React.RefAttributes<LucideIcon>;

function IconImpl({ as: IconComponent, ...props }: IconProps) {
  return <IconComponent {...props} />;
}

cssInterop(IconImpl, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      height: 'size',
      width: 'size',
    },
  },
});

// Icono de Lucide con color y tamaño por clases: <Icon as={Play} className="text-playing-tone" />.
function Icon({ as: IconComponent, className, size = 16, ...props }: IconProps) {
  const textClass = React.useContext(TextClassContext);
  return (
    <IconImpl
      as={IconComponent}
      className={cn('text-foreground', textClass, className)}
      size={size}
      {...props}
    />
  );
}

export { Icon };
