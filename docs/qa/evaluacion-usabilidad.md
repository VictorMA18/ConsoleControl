# Evaluación de usabilidad

| Campo       | Valor                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------- |
| Tarea       | T20 (TW-20) · TW-135 a TW-140                                                                   |
| Fecha       | 18/11/2026                                                                                      |
| Método      | Evaluación heurística (10 heurísticas de Nielsen) más medición del flujo, sobre la app real     |
| Dispositivo | Emulador Android `ConsoleControl_GamaBaja`: Android 17, 720 × 1600, 3 GB de RAM, Expo Go 58.0.5 |
| Versión     | Rama `feature/T20-usabilidad`                                                                   |

## Guion de tareas (TW-135)

1. Iniciar una sesión de 1 hora con 1 mando en PS5 #1.
2. Ver cuánto tiempo le queda a una sesión en curso.
3. Entender la alerta de 5 minutos y el estado "Tiempo cumplido".
4. Intentar iniciar una sesión con más mandos de los disponibles.

## Mediciones (TW-137)

| Medida                            | Resultado                          | Cómo se midió                                          |
| --------------------------------- | ---------------------------------- | ------------------------------------------------------ |
| Toques para iniciar una sesión    | **2** (tarjeta e "Iniciar sesión") | Toques reales con `adb shell input tap` en el emulador |
| Criterio RNF-02 (máximo 2 toques) | Cumple                             |                                                        |

Los tiempos son de respuesta de la app con toques automáticos: no incluyen lo que tarda una persona en decidir y tocar. Incluyen el retraso de leer la pantalla, así que son un máximo.
| Tiempo del toque en la tarjeta al diálogo visible | 0.65 s | Marca de tiempo antes del toque y lectura de píxeles de la pantalla hasta ver el botón azul |
| Tiempo total hasta ver la tarjeta "En juego" | 1.3 s | Ídem, hasta ver la franja roja de Xbox #1 |

## Hallazgos (TW-138)

Severidad: 0 sin problema, 1 cosmético, 2 menor, 3 mayor, 4 crítico.

| #    | Heurística                     | Hallazgo                                                                                     | Sev. | Ajuste (TW-139)                                                                                       |
| ---- | ------------------------------ | -------------------------------------------------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------- |
| U-01 | Visibilidad del estado         | El estado de cada consola se ve con color y etiqueta, y el cronómetro cambia cada segundo    | 0    | —                                                                                                     |
| U-02 | Accesibilidad y contraste      | El texto sobre el ámbar daba 4.22:1, bajo el mínimo de 4.5:1                                 | 3    | Corregido: texto `#451A03`, 6.97:1 (T04)                                                              |
| U-03 | Diseño minimalista             | La tarjeta libre repetía el tipo ("PS4 · 4 mandos libres") y partía la línea                 | 1    | Corregido: "4 mandos libres"; el tipo queda para el lector de pantalla                                |
| U-04 | Diseño minimalista             | En la tarjeta en juego, "Quedan 00:04:54 · 1 mando" se partía a media frase                  | 1    | Corregido: tiempo restante y mandos en líneas separadas                                               |
| U-05 | Prevención de errores          | Se pueden elegir más mandos que los libres; el error llega al pulsar "Iniciar sesión"        | 2    | Se mantiene: es el escenario 2 de HU-001, el diálogo muestra los mandos libres y sugiere alternativas |
| U-06 | Reconocer antes que recordar   | Los chips del filtro no caben y "Switch" y "Xbox" quedan fuera de la vista                   | 1    | Se mantiene: el chip cortado indica que hay desplazamiento                                            |
| U-07 | Control y libertad             | No hay forma de cerrar una sesión: "Tiempo cumplido" queda hasta la liquidación              | 3    | Sprint 2: HU-005 (liquidación)                                                                        |
| U-08 | Visibilidad del estado         | La alerta solo llega con la app abierta                                                      | 2    | Decidido en el ADR 0011; se evalúa para el Sprint 2                                                   |
| U-09 | Coincidencia con el mundo real | El tiempo se muestra como hh:mm:ss, igual que un cronómetro; el monto como "S/ 10.00"        | 0    | —                                                                                                     |
| U-10 | Consistencia                   | Los botones, opciones y chips usan los mismos colores, radios y alturas mínimas (48 a 64 dp) | 0    | —                                                                                                     |

## Conclusión

Iniciar una sesión toma 2 toques y no hay problemas críticos abiertos. Los dos de severidad 3 están resueltos (U-02) o planificados (U-07).

## Aprendizajes para HU-005 en adelante (TW-140)

- HU-005 debe sacar a la consola de "Tiempo cumplido" y liberar sus mandos en un toque desde la tarjeta.
- El cobro final debe partir del total estimado guardado al iniciar (TW-106) y recalcularse solo si se jugó más.
- Cualquier aviso nuevo debe llevar color, texto y vibración, como en HU-004.
