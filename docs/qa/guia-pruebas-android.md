# Guía de pruebas en Android de gama baja

| Campo   | Valor                                                                              |
| ------- | ---------------------------------------------------------------------------------- |
| Tarea   | T18 (TW-18)                                                                        |
| Ejecuta | VN, en un celular físico                                                           |
| Estado  | **No ejecutado.** Necesita el APK de T19 y la interfaz de T07, T08, T11, T14 y T16 |

Los resultados se registran en [`registro-resultados.md`](registro-resultados.md). Los defectos se reportan con [`reporte-defectos.md`](reporte-defectos.md). Nunca se marca `Aprobó` sin ejecutar el caso.

## 1. Ficha del dispositivo

| Dato                             | Valor |
| -------------------------------- | ----- |
| Modelo                           |       |
| Versión de Android               |       |
| RAM                              |       |
| Almacenamiento libre             |       |
| Ahorro de batería                |       |
| Versión de la app (commit o APK) |       |

## 2. Preparación

1. Descargar el APK generado con [`generar-apk.md`](generar-apk.md).
2. Copiarlo al celular y abrirlo. Si Android lo pide, permitir instalar apps de esa fuente.
3. Abrir la app una vez: las tablas y los datos iniciales se cargan solos.
4. Comprobar que el muro coincide con [`datos-de-prueba.md`](datos-de-prueba.md).
5. Activar la hora automática en Ajustes (limitación L3 del [spike](../architecture/spike-cronometro.md)).
6. Tener a mano un cronómetro de referencia en otro dispositivo.

Para repetir una prueba desde cero, borrar los datos de la app en Ajustes o reinstalarla.

Para CP-011 hacen falta 6 mandos en una consola y el seed trae 4: inventario Por confirmar. Si no se resuelve, registrar el caso como `Bloqueado`.

## 3. Procedimientos

### TW-123 · Casos CP-001 a CP-010

1. Ejecutar cada caso de [`casos-de-prueba.md`](casos-de-prueba.md) en orden.
2. Comparar con su resultado esperado.
3. Registrar el resultado y la evidencia en `registro-resultados.md`.

CP-009 se hace con la app abierta: el aviso con la app cerrada no está implementado (H-04 en [`revision-codigo.md`](revision-codigo.md)).

### TW-124 · Segundo plano

Iniciar una sesión `fijo_120` y el cronómetro de referencia a la vez. Minimizar la app el tiempo indicado, volver y anotar la diferencia.

**Resultado esperado:** el tiempo mostrado coincide con la referencia. La pantalla refresca cada segundo, así que puede diferir hasta 1 segundo (L6).

| Tiempo minimizada | Tiempo en la app | Tiempo de referencia | Diferencia (s) | Evidencia |
| ----------------- | ---------------- | -------------------- | -------------- | --------- |
| 5 min             |                  |                      |                |           |
| 15 min            |                  |                      |                |           |
| 30 min            |                  |                      |                |           |

### TW-125 · Reinicio del teléfono (CP-005)

1. Iniciar sesiones en dos consolas.
2. Apagar el celular y esperar 2 minutos.
3. Encenderlo y abrir la app.

**Resultado esperado:** las dos sesiones siguen activas con el tiempo real, incluido el tiempo apagado. La app no se abre sola (L4).

| Consola | Tiempo en la app | Tiempo de referencia | Diferencia (s) | Evidencia |
| ------- | ---------------- | -------------------- | -------------- | --------- |
|         |                  |                      |                |           |
|         |                  |                      |                |           |

### TW-126 · Modo de ahorro de batería

Activar el ahorro de batería y repetir TW-124 y TW-125.

**Resultado esperado:** los mismos resultados. La app puede cerrarse en segundo plano, pero el tiempo sigue exacto al volver (L1).

| Prueba           | Diferencia (s) | ¿La app se cerró? | Evidencia |
| ---------------- | -------------- | ----------------- | --------- |
| Minimizar 5 min  |                |                   |           |
| Minimizar 15 min |                |                   |           |
| Minimizar 30 min |                |                   |           |
| Reinicio         |                |                   |           |

### TW-127 · Carga con 4 consolas (CP-013)

1. Iniciar sesiones en las 4 consolas de D-06.
2. Usar el muro durante 10 minutos.

**Resultado esperado:** los 4 cronómetros avanzan sin bloqueos ni cierres.

| Observación         | Resultado |
| ------------------- | --------- |
| ¿Se trabó? ¿Cuándo? |           |
| ¿Se cerró? ¿Cuándo? |           |
| Evidencia           |           |

### TW-129 · Repetir pruebas fallidas

Cuando un defecto esté corregido:

1. Instalar el APK con la corrección y anotar su commit.
2. Repetir el caso fallido.
3. Agregar una fila nueva en `registro-resultados.md`, sin borrar la anterior.
4. Anotar el resultado en el defecto de Jira.

| Caso | Defecto | Commit probado | Resultado | Fecha |
| ---- | ------- | -------------- | --------- | ----- |
|      |         |                |           |       |

## 4. Evidencia

- Nombre: `CP-0XX_fecha.png`, por ejemplo `CP-005_2026-11-10.png`.
- Ubicación: `docs/qa/evidencias/`.
- No subir archivos pesados al repositorio: los videos van en un enlace dentro del registro.
