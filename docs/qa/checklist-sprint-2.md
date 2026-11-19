# Checklist manual del Sprint 2

Lo ejecuta VN en el celular, una sola vez, al final del sprint. Las casillas empiezan vacías.

## Antes de empezar

- [ ] Borra los datos de la app (o reinstálala): hay 3 migraciones nuevas (`0002` a `0004`) y se aplican solas al abrirla. Corre con `pnpm start`.
- [ ] Para ver los estados sin esperar, abre **Herramientas de desarrollo → Prueba de persistencia** y pulsa "4. Sesión con 6 min restantes": al minuto 1 pasa a **Por terminar** (titila y vibra) y al minuto 6 a **Tiempo cumplido**.

## Interfaz y navegación

> El ícono y la pantalla de carga solo se ven en un APK nuevo (en Expo Go sale el de Expo). La migración 0005 renombra las consolas a «MAQ #n» sin borrar datos.

- [ ] Al abrir la app aparece el ícono en blanco y negro y se va con un fundido, sin spinner intermedio.
- [ ] Ningún contenido queda debajo de la barra de navegación de Android: pestañas, botón «Cobrar y Liberar», diálogo de sesión y herramientas de desarrollo.
- [ ] Arriba del muro hay 4 fichas en 2 × 2 (Disponible, En juego, Por terminar, Por cobrar), sin franja y con el icono del color del estado.
- [ ] Las máquinas se llaman «MAQ #1» a «MAQ #5»; buscar «3» deja solo MAQ #3.
- [ ] Cada tarjeta muestra la pastilla con el logo de su plataforma (PlayStation, Xbox o Switch), el nombre, el cronómetro y la columna de mandos, tiempo y dinero.
- [ ] En el diálogo de sesión, las opciones de modalidad (incluida «Tiempo libre») tienen el texto centrado.
- [ ] En el cobro con efectivo hay un solo campo «Recibido» y debajo el vuelto; en pago mixto el vuelto usa solo la parte en efectivo.
- [ ] Al tocar un campo (recibido, montos de pago mixto, efectivo contado), la pantalla sube y el campo queda visible encima del teclado.
- [ ] Caja muestra el total del turno, el reparto por método, el arqueo con el efectivo esperado y el historial de turnos.
- [ ] La pestaña Sistema cambia el tema (Sistema, Claro, Oscuro), la elección se mantiene al reabrir, y las herramientas de desarrollo son botones legibles en los dos temas.
- [ ] La tarjeta se hunde un poco al tocarla; al filtrar o buscar, las tarjetas se reacomodan suave.
- [ ] "Finalizar sesión" y "Cerrar turno" piden confirmación en un diálogo que aparece con una transición corta y se puede cancelar tocando fuera.

## HU-005 · Liquidación

- [ ] Finalizar una sesión "En Juego" muestra minutos, mandos y total.
- [ ] Finalizar una sesión en "Tiempo Cumplido" muestra el exceso.
- [ ] Un exceso de 2 minutos no cobra penalidad.
- [ ] Un exceso de 4 minutos cobra la fracción.
- [ ] Cerrar la app con la sesión por cobrar y reabrir conserva el resumen.

## HU-010 · Vuelto

- [ ] El vuelto se lee bien de lejos (tamaño y contraste).
- [ ] Con entrega menor al total no muestra un vuelto negativo.
- [ ] Con pago mixto solo considera la parte en efectivo.

## HU-006 · Cobro

- [ ] Cobrar con efectivo deja la consola "Disponible" y devuelve los mandos al stock.
- [ ] Cobrar con Yape o Plin hace lo mismo y queda separado del efectivo.
- [ ] Pago mixto con la suma correcta funciona.
- [ ] Pago mixto con la suma incorrecta no deja cobrar.
- [ ] El botón "Cobrar y Liberar" está bloqueado sin método.
- [ ] Cerrar la app a mitad del cobro no deja la consola en un estado raro.

## HU-007 · Arqueo

- [ ] Con 3 cobros de distintos métodos, el balance separa efectivo, Yape/Plin y fiado.
- [ ] Contar el efectivo justo da Conforme.
- [ ] Contar S/. 5 menos da Faltante y muestra la lista de auditoría.
- [ ] Cerrar el turno bloquea editar los cobros.
- [ ] El resumen del turno cerrado se puede consultar al día siguiente.
- [ ] Después del cierre, el siguiente cobro abre un turno nuevo.
