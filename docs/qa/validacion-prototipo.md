# Validación del prototipo

| Campo     | Valor                                                                                                                     |
| --------- | ------------------------------------------------------------------------------------------------------------------------- |
| Tarea     | T05 (TW-5) · TW-54 a TW-58                                                                                                |
| Fecha     | 18/11/2026                                                                                                                |
| Modalidad | Revisión con cliente simulado: VN asume el rol de propietario del ciber                                                   |
| Prototipo | [Figma · Prototipo Sprint 1](https://www.figma.com/proto/EtdgGoBGjWA9zN4lmK4wYU?node-id=3-2&starting-point-node-id=3%3A2) |
| Resultado | **Aceptado**                                                                                                              |

## Recorrido

1. Muro de consolas con las 5 consolas disponibles.
2. Tocar PS5 #1 y revisar el diálogo con 1 mando y 1 hora ya elegidos.
3. Pulsar "Iniciar sesión" y ver la tarjeta en rojo con su cronómetro.
4. Alerta de 5 minutos: tarjeta en ámbar y aviso escrito.
5. Tiempo cumplido: ámbar fijo.
6. Mandos insuficientes en PS4 #1 con alternativas.
7. Consola ocupada con su motivo.

## Comprobaciones

| Criterio                                                            | Fuente                         | Resultado                                                                                          |
| ------------------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------- |
| Iniciar una sesión en máximo 2 toques                               | HU-001, RNF-02                 | Cumple: tarjeta y "Iniciar sesión"                                                                 |
| Mandos de 1 a 6 y modalidades 30 min, 1 h, 2 h y libre              | HU-001                         | Cumple                                                                                             |
| Verde disponible, rojo en juego, ámbar por terminar o cumplido      | HU-002 escenario 3             | Cumple, con etiqueta en cada estado                                                                |
| Total estimado visible antes de iniciar                             | HU-003, TW-48                  | Cumple                                                                                             |
| Aviso a los 5 minutos y estado "Tiempo cumplido"                    | HU-004                         | Cumple                                                                                             |
| Mensajes de mandos insuficientes y consola ocupada con alternativas | HU-001 escenarios 2 y 3, TW-50 | Cumple                                                                                             |
| Contraste del texto sobre cada franja de estado                     | WCAG 2.2, 4.5:1                | Cumple: 5.02:1, 6.47:1 y 6.97:1 (el texto sobre ámbar se oscureció a `#451A03` porque daba 4.22:1) |

## Ajustes

No se pidieron ajustes críticos. Los hallazgos de usabilidad de la app implementada están en [`evaluacion-usabilidad.md`](evaluacion-usabilidad.md) (T20).

## Visto bueno

Aceptado por VN en el rol de propietario, el 18/11/2026.
