# Generar el APK de demostración

| Campo  | Valor                |
| ------ | -------------------- |
| Tarea  | T19 (TW-19) · TW-133 |
| Fecha  | 06/11/2026           |
| Estado | **APK no generado**  |

## Por qué no se generó

- **No hay nada que demostrar.** Sin T07, T08, T11, T14 y T16, el APK solo muestra el título: los enlaces a las pantallas de prueba solo aparecen en desarrollo (`__DEV__`).
- **El proyecto no está vinculado a EAS.** No hay `eas.json` ni `extra.eas.projectId`, y `app.json` no tiene `android.package`.
- **Compilar en este equipo no es posible.** No hay Android SDK (`ANDROID_HOME` vacío, sin `adb`).

Lo comprobado: `npx expo export --platform android` funciona, y `npx eas-cli whoami` muestra la cuenta `victornma` con sesión iniciada en este equipo.

## Qué hace falta

| Dato                                      | Quién | Estado                      |
| ----------------------------------------- | ----- | --------------------------- |
| Interfaz fusionada en `develop`           | RF    | Pendiente                   |
| Cuenta de Expo a usar                     | VN    | Por confirmar (`victornma`) |
| Identificador Android (`android.package`) | VN    | Por confirmar               |

## Pasos

1. Actualizar `develop`: `git switch develop && git pull`.
2. Crear una rama de la tarea T19.
3. Agregar a `app.json` el identificador en `expo.android.package`.
4. Vincular el proyecto (crea el proyecto en Expo y escribe el `projectId`):

   ```bash
   pnpm dlx eas-cli init
   ```

5. Crear `eas.json` con un perfil que genere APK:

   ```json
   {
     "build": {
       "preview": {
         "distribution": "internal",
         "android": { "buildType": "apk" }
       }
     }
   }
   ```

6. Compilar en la nube:

   ```bash
   pnpm dlx eas-cli build -p android --profile preview
   ```

7. Descargar el APK del enlace que muestra el comando e instalarlo siguiendo [`guia-pruebas-android.md`](guia-pruebas-android.md).
8. Anotar en el registro el commit con el que se compiló.
