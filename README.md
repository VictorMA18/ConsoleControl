# ConsoleControl Mobile

App móvil offline-first para controlar el alquiler de consolas en un ciber. Reemplaza el cuaderno con el que hoy se controlan los tiempos de juego, los cobros y el mantenimiento.

Antes de cambiar código lee [`AGENTS.md`](AGENTS.md). La documentación completa está en [`docs/`](docs/README.md).

## Requisitos

- Node.js LTS compatible con el SDK 58 de Expo (incluye npm).
- pnpm en la versión declarada en `packageManager` de `package.json`.
- Git.
- Celular con Expo Go compatible con SDK 58, o Android Studio con un emulador configurado.

## Instalación local

Si aún no tienes el repositorio, clónalo y entra en la carpeta:

```bash
git clone https://github.com/VictorMA18/ConsoleControl.git
cd ConsoleControl
git switch develop
```

Si ya tienes el proyecto abierto, usa su carpeta actual. Ejecuta los siguientes comandos
desde la raíz, donde está `package.json`:

```bash
node --version
npm install -g pnpm@12.15.0
pnpm --version
pnpm install
```

La versión de pnpm indicada corresponde al `packageManager` actual. Si ese campo cambia,
usa la nueva versión declarada. Conserva `pnpm-lock.yaml` y el ajuste `node-linker=hoisted`
de `.npmrc` para que el equipo comparta las mismas dependencias.

No necesitas configurar Supabase ni un archivo `.env` para ejecutar esta etapa del proyecto.
SQLite se prepara automáticamente al abrir la app.

## Ejecutar en un celular

1. Instala Expo Go compatible con el SDK del proyecto. Puedes consultar las versiones en
   [Expo Go](https://expo.dev/go).
2. Conecta la computadora y el celular a la misma red Wi-Fi.
3. Inicia el servidor de desarrollo:

```bash
pnpm start
```

4. Escanea el QR de la terminal desde Expo Go en Android o desde la cámara en iOS.
   En iOS físico, inicia sesión en Expo CLI con `pnpm exec expo login` y usa la misma
   cuenta en Expo Go si lo solicita.
5. Espera a que termine la carga. Debe aparecer el encabezado **Muro de consolas** y el
   texto **ConsoleControl Mobile**.

Mantén la terminal abierta mientras desarrollas. Para detener el servidor, pulsa `Ctrl+C`.

## Ejecutar en un emulador de Android

1. Instala Android Studio y, desde SDK Manager, instala Android SDK y Android SDK Platform-Tools.
2. En Device Manager, crea un dispositivo virtual con una imagen de Android compatible
   con Expo Go y enciéndelo. Espera a que aparezca su pantalla de inicio.
3. Desde la raíz del proyecto, ejecuta:

```bash
pnpm android
```

4. Expo abrirá el proyecto en el emulador; acepta la instalación de Expo Go si se solicita.
5. Comprueba que se muestre **Muro de consolas**.

Si ya ejecutaste `pnpm start`, pulsa `a` en esa terminal para abrir el emulador sin iniciar
otro servidor. Si no se detecta, comprueba que `adb devices` lo liste y que Android SDK
esté configurado en tu entorno. El simulador de iOS requiere macOS y Xcode; allí se usa
`pnpm ios`.

Guías oficiales: [emulador de Android](https://docs.expo.dev/workflow/android-studio-emulator/)
y [ejecución con Expo](https://docs.expo.dev/get-started/start-developing/).

## Navegación inicial (T02)

- `app/_layout.tsx` configura la navegación Stack y la ruta inicial `index`.
- `app/index.tsx` corresponde a `/` y muestra la pantalla **Muro de consolas**.
- El contenido del muro es provisional; las tarjetas y su comportamiento corresponden a T07.
- En desarrollo, el enlace **Prueba de persistencia** abre `/dev/persistencia`.
  La flecha de regreso del encabezado permite volver al muro.

## Problemas frecuentes

- **El celular no conecta:** verifica la red Wi-Fi y permite a Node.js acceder a redes privadas
  en el firewall. Si la red bloquea la conexión entre dispositivos, prueba
  `pnpm exec expo start --tunnel` y acepta la instalación del componente de túnel si se solicita.
  El túnel requiere internet.
- **Expo Go indica SDK incompatible:** instala una versión compatible desde
  [Expo Go](https://expo.dev/go). No cambies las dependencias del proyecto para resolverlo.
- **Android SDK o adb no se encuentran:** revisa la ubicación del SDK en Android Studio,
  configura `ANDROID_HOME` con esa ruta y agrega su carpeta `platform-tools` al `PATH`.
  Abre una nueva terminal y vuelve a ejecutar `adb devices`.
- **Los cambios no aparecen:** detén el servidor y ejecuta `pnpm exec expo start --clear`.

## Verificación de los cuatro integrantes (T02)

Cada integrante debe ejecutar la prueba en su propia computadora y registrar el resultado
en la subtarea de Jira. Todos deben probar la misma revisión, identificada con
`git rev-parse --short HEAD`, incluyendo los cambios de T02 una vez compartidos.

1. Instalar dependencias y arrancar Expo sin errores.
2. Abrir la app en un celular o emulador y comprobar el encabezado **Muro de consolas**.
3. Abrir **Prueba de persistencia** y regresar al muro con la flecha del encabezado.
   No es necesario crear ni finalizar sesiones para validar la navegación.
4. Adjuntar en Jira una captura del muro y registrar revisión, fecha, sistema operativo,
   versiones de Node/pnpm, dispositivo y cualquier error encontrado.

| Integrante                        | Instalación y servidor                                     | App y navegación | Evidencia en Jira |
| --------------------------------- | ---------------------------------------------------------- | ---------------- | ----------------- |
| JS · Juan Salas                   | Pendiente                                                  | Pendiente        | Pendiente         |
| RF · Rodrigo Ferdinand Quispe     | Reportado por RF: `pnpm install` y `pnpm start` ejecutados | Pendiente        | Pendiente         |
| VM · Victor Maldonado             | Pendiente                                                  | Pendiente        | Pendiente         |
| VN · Victor Narciso Mamani Anahua | Pendiente                                                  | Pendiente        | Pendiente         |

La subtarea se completa cuando los cuatro integrantes confirmen la ejecución y navegación
sin errores. Arrancar el servidor por sí solo no confirma que la app abra en el dispositivo.

## Comandos

| Comando          | Para qué                        |
| ---------------- | ------------------------------- |
| `pnpm start`     | Iniciar Expo                    |
| `pnpm android`   | Abrir en un emulador de Android |
| `pnpm lint`      | ESLint                          |
| `pnpm typecheck` | Verificar tipos de TypeScript   |
| `pnpm test`      | Pruebas con Jest                |
| `pnpm format`    | Aplicar Prettier                |

Antes de abrir un pull request deben pasar `pnpm lint`, `pnpm typecheck` y `pnpm test`. El flujo de ramas está en [`docs/guides/flujo-git.md`](docs/guides/flujo-git.md).
