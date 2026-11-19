# Generar el APK de demostración

| Campo          | Valor                                                                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Tarea          | T19 (TW-19) · TW-133                                                                                                                           |
| Fecha          | 18/11/2026                                                                                                                                     |
| Estado         | **APK generado**                                                                                                                               |
| Build          | [EAS 9ee60139](https://expo.dev/accounts/victornma/projects/consolecontrol-mobile/builds/9ee60139-b7c8-4688-983a-a6f85adb5814), commit 520f73d |
| Identificador  | `pe.thewolfs.consolecontrol`, versión 1.0.0                                                                                                    |
| Cuenta de Expo | `victornma`, proyecto `consolecontrol-mobile`                                                                                                  |

## Cómo se generó

1. `app.json` tiene `expo.android.package` y `extra.eas.projectId` (vinculado con `eas init`).
2. `eas.json` tiene el perfil `preview` con `distribution: internal` y `android.buildType: apk`.
3. Compilar en la nube:

   ```bash
   pnpm dlx eas-cli build -p android --profile preview
   ```

4. Instalar en un emulador o celular conectado:

   ```bash
   pnpm dlx eas-cli build:run -p android --latest
   ```

   En un celular sin cable, abrir el enlace del build desde el propio celular y descargar el APK.

## Problemas resueltos

| Defecto                            | Causa                                                                                                                                                                 | Corrección                                                                                |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| TW-147: el build fallaba en Gradle | `babel.config.js` usaba `babel-preset-expo` sin declararlo, y el preset de NativeWind pedía `@babel/plugin-transform-react-jsx`; en EAS `pnpm` no los deja accesibles | Ambos declarados como dependencias de desarrollo (en la versión 7 compatible con Babel 7) |

Antes de compilar en EAS conviene probar en local con una instalación limpia: `pnpm install --frozen-lockfile` y `npx expo export:embed --platform android --dev false ...`.
