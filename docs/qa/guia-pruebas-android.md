# Guía de pruebas en Android de gama baja

| Campo   | Valor                                                                                                                              |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Tarea   | T18 (TW-18)                                                                                                                        |
| Ejecuta | VN, en un celular físico                                                                                                           |
| Estado  | **Ejecutado el 18/11/2026** en el emulador de gama baja con el APK de T19: 13 de 13 casos aprobados (ver `registro-resultados.md`) |

Cada corrida es una batería corta de unos 5 minutos: el tiempo de la app se calcula desde `started_at`, así que minimizar 1 o 2 minutos prueba lo mismo que media hora. Los resultados se registran en [`registro-resultados.md`](registro-resultados.md). Los defectos se reportan con [`reporte-defectos.md`](reporte-defectos.md). Nunca se marca `Aprobó` sin ejecutar el caso.

## 1. Ficha del dispositivo

| Dato                             | Valor                                                             |
| -------------------------------- | ----------------------------------------------------------------- |
| Modelo                           | Emulador Android `ConsoleControl_GamaBaja` (sdk_gphone16k_x86_64) |
| Versión de Android               | 17                                                                |
| RAM                              | 3 GB                                                              |
| Almacenamiento libre             | 5.4 GB de 7.7 GB                                                  |
| Ahorro de batería                | Apagado (encendido solo en TW-126)                                |
| Versión de la app (commit o APK) | APK 1.0.0, build de EAS 9ee60139, commit 520f73d                  |

## 2. Preparación

1. Descargar el APK generado con [`generar-apk.md`](generar-apk.md).
2. Copiarlo al celular y abrirlo. Si Android lo pide, permitir instalar apps de esa fuente.
3. Abrir la app una vez: las tablas y los datos iniciales se cargan solos.
4. Comprobar que el muro coincide con [`datos-de-prueba.md`](datos-de-prueba.md).
5. Activar la hora automática en Ajustes (limitación L3 del [spike](../architecture/spike-cronometro.md)).
6. Tener a mano un cronómetro de referencia en otro dispositivo.

Para repetir una prueba desde cero, borrar los datos de la app en Ajustes o reinstalarla.

Para CP-011 se usa PS5 #1, que tiene 6 mandos.

## 3. Procedimientos

### TW-123 · Casos CP-001 a CP-010

1. Ejecutar cada caso de [`casos-de-prueba.md`](casos-de-prueba.md) en orden.
2. Comparar con su resultado esperado.
3. Registrar el resultado y la evidencia en `registro-resultados.md`.

CP-009 y CP-010 se hacen con la sesión de prueba "4. Sesión con 6 min restantes" (solo en la app de desarrollo) y con la app abierta: el aviso con la app cerrada no está implementado (H-04 en [`revision-codigo.md`](revision-codigo.md)).

### TW-124 · Segundo plano

Iniciar una sesión `fijo_120` y el cronómetro de referencia a la vez. Minimizar la app 1 y 2 minutos, volver y anotar la diferencia.

**Resultado esperado:** el tiempo mostrado coincide con la referencia. La pantalla refresca cada segundo, así que puede diferir hasta 1 segundo (L6).

| Tiempo minimizada | Tiempo en la app           | Tiempo de referencia    | Diferencia (s)                      | Evidencia                                              |
| ----------------- | -------------------------- | ----------------------- | ----------------------------------- | ------------------------------------------------------ |
| 1 min             | PS5 03:24 a las 18:58:30   | 03:24 (inicio 18:55:06) | 0                                   | [`CP-004_1min`](evidencias/CP-004_1min_2026-11-18.png) |
| 2 min             | PS5 05:38 a las 19:00:43.8 | 05:37.8                 | 1 o menos (refresco de la pantalla) | [`CP-004_2min`](evidencias/CP-004_2min_2026-11-18.png) |

### TW-125 · Reinicio del teléfono (CP-005)

1. Iniciar sesiones en dos consolas.
2. Apagar el celular y esperar 1 minuto.
3. Encenderlo y abrir la app.

**Resultado esperado:** las dos sesiones siguen activas con el tiempo real, incluido el tiempo apagado. La app no se abre sola (L4).

| Consola   | Tiempo en la app       | Tiempo de referencia | Diferencia (s) | Evidencia                                    |
| --------- | ---------------------- | -------------------- | -------------- | -------------------------------------------- |
| PS5 #1    | 09:31 a las 19:04:36.9 | 09:30.9              | 1 o menos      | [`CP-005`](evidencias/CP-005_2026-11-18.png) |
| Switch #1 | 07:32 a las 19:04:36.9 | 07:31.9              | 1 o menos      | [`CP-005`](evidencias/CP-005_2026-11-18.png) |

### TW-126 · Modo de ahorro de batería

Activar el ahorro de batería y repetir TW-124 y TW-125.

**Resultado esperado:** los mismos resultados. La app puede cerrarse en segundo plano, pero el tiempo sigue exacto al volver (L1).

| Prueba          | Diferencia (s)                                                                           | ¿La app se cerró?  | Evidencia                                    |
| --------------- | ---------------------------------------------------------------------------------------- | ------------------ | -------------------------------------------- |
| Minimizar 1 min | 1 o menos (PS5 06:53 a las 19:01:58.7)                                                   | No (mismo proceso) | [`TW-126`](evidencias/TW-126_2026-11-18.png) |
| Reinicio        | No aplica en el emulador: Android apaga el ahorro al reiniciar con el cargador conectado | —                  | —                                            |

### TW-127 · Carga con 4 consolas (CP-013)

1. Iniciar sesiones en las 4 consolas de D-06.
2. Usar el muro durante 2 minutos.

**Resultado esperado:** los 4 cronómetros avanzan sin bloqueos ni cierres.

| Observación         | Resultado                                                              |
| ------------------- | ---------------------------------------------------------------------- |
| ¿Se trabó? ¿Cuándo? | No: 4 cronómetros avanzando durante 2 minutos, sin ANR                 |
| ¿Se cerró? ¿Cuándo? | No: mismo proceso (PID 5147) los 2 minutos; memoria de 92.6 a 101.8 MB |
| Evidencia           | [`CP-013`](evidencias/CP-013_2026-11-18.png)                           |

### TW-129 · Repetir pruebas fallidas

Cuando un defecto esté corregido:

1. Instalar el APK con la corrección y anotar su commit.
2. Repetir el caso fallido.
3. Agregar una fila nueva en `registro-resultados.md`, sin borrar la anterior.
4. Anotar el resultado en el defecto de Jira.

| Caso          | Defecto | Commit probado                                 | Resultado                       | Fecha            |
| ------------- | ------- | ---------------------------------------------- | ------------------------------- | ---------------- |
| CP-002        | TW-148  | Rama `feature/T18-ejecucion-pruebas` (Expo Go) | Aprobó                          | 18/11/2026 19:13 |
| Build del APK | TW-147  | 520f73d                                        | Aprobó: build 9ee60139 generado | 18/11/2026 18:53 |

## 4. Evidencia

- Nombre: `CP-0XX_fecha.png`, por ejemplo `CP-005_2026-11-10.png`.
- Ubicación: `docs/qa/evidencias/`.
- No subir archivos pesados al repositorio: los videos van en un enlace dentro del registro.
