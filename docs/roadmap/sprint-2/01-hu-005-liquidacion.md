# Parte 01 · HU-005 Cierre de sesión y liquidación (5 puntos)

Rama: `feature/HU-005-liquidacion`, desde `develop`. Ficha: crear `docs/specs/hu-005-liquidacion.md` con el formato de `hu-004-alerta-vencimiento.md` y el texto de abajo.

**Como** administrador del ciber, **quiero** ver el resumen exacto de cobro al terminar una sesión, **para** cobrar el monto correcto en pocos segundos.
Dependencias técnicas: HU-003. Casos de uso y reglas: CU-002, RF-05, RN-03, RN-04, RNF-01.

## Criterios de aceptación (Given-When-Then)

**Escenario 1. Resumen de cobro**

- DADO QUE una consola está "En Juego" o en "Tiempo Cumplido",
- CUANDO el administrador la pulsa para finalizar la sesión,
- ENTONCES el sistema muestra minutos jugados, mandos utilizados, penalidad (si hubo) y total en soles en menos de 100 ms.

**Escenario 2. Margen de cortesía**

- DADO QUE el cliente excedió el tiempo contratado,
- CUANDO el exceso supera los 3 minutos de gracia,
- ENTONCES el sistema tarifa automáticamente la fracción de 15 minutos (RN-03).

## Trabajo

- **Datos (migración nueva):** estado de cobro de la sesión (hoy solo `activa` y `finalizada`): añadir `por_cobrar` y `cobrada`. Guardar `ended_at` al finalizar y el resultado de la liquidación (minutos jugados, minutos de exceso, penalidad y total, en céntimos) para que el cobro y el arqueo lean el mismo número. Registrar la decisión en `docs/adr/0012-estados-de-sesion-y-cobro.md`.
- **Lógica:** función pura `calculateSettlement` (en `src/services/`) que recibe la sesión (inicio, fin, duración contratada, modalidad, mandos), el tarifario y la hora, y devuelve el desglose. Minutos jugados = `fin − started_at`, nunca un contador. **Reutiliza `src/services/tariff.ts`** (`GRACE_MINUTES` = 3, `BLOCK_MINUTES` = 15, `chargedMinutes`, `calculateRate`): no dupliques las constantes.
- **Interfaz:** ruta nueva `app/cobro/[sessionId].tsx`. Al tocar una tarjeta ocupada del muro se abre ese resumen (hoy abre el diálogo de inicio): minutos, mandos, penalidad y total en números grandes, y el botón "Finalizar sesión" que guarda `ended_at` y pasa la sesión a `por_cobrar`. El cálculo es en memoria (meta: menos de 100 ms). La consola sigue "en juego" hasta que se cobre (parte 03).

## Por confirmar con VN

- Penalidad pasada la gracia: por defecto, el exceso se cobra por fracciones de 15 minutos redondeando hacia arriba, con precio derivado de la tarifa por hora.
- "Tiempo libre": no hay exceso; se cobra el tiempo real jugado.

## Pruebas (lógica pura, `__tests__/services/settlement.test.ts`)

Con tarifas definidas dentro de la prueba, no las del seed.

1. Sin exceso: el total es el monto base.
2. Exceso de hasta 3 minutos: sin penalidad.
3. Exceso de más de 3 minutos: cobra la fracción de 15 minutos.
4. Tiempo libre: cobra el tiempo real.

## Hecho cuando

La liquidación se calcula desde SQLite, el resumen aparece desde la tarjeta ocupada y las 4 pruebas están escritas. Lint y typecheck en verde.
