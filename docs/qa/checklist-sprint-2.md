# Checklist manual del Sprint 2

Lo ejecuta VN en el celular, una sola vez, al final del sprint. Las casillas empiezan vacías.

## Antes de empezar

- [ ] Borra los datos de la app (o reinstálala): hay 3 migraciones nuevas (`0002` a `0004`) y se aplican solas al abrirla. Corre con `pnpm start`.
- [ ] Para ver los estados sin esperar, abre **Herramientas de desarrollo → Prueba de persistencia** y pulsa "4. Sesión con 6 min restantes": al minuto 1 pasa a **Por terminar** (titila y vibra) y al minuto 6 a **Tiempo cumplido**.

## Interfaz y navegación

> El ícono y la pantalla de carga solo se ven en un APK nuevo (en Expo Go sale el de Expo).

- [ ] Al abrir la app aparece el ícono (mando sobre verde) y se va con un fundido, sin spinner intermedio.
- [ ] La barra de pestañas queda encima de la barra de navegación de Android (gestos y tres botones), sin taparse.
- [ ] El muro muestra una tarjeta ancha por consola con la franja del estado, la pastilla de plataforma (logo de PlayStation), el nombre, el cronómetro y la columna de mandos, tiempo y dinero.
- [ ] Una consola libre muestra sus mandos, «Libre» y la tarifa por hora; una en juego, «2/6 mandos», el restante y el total.
- [ ] El resumen de arriba cuenta cada estado: Disponible, En juego, Por terminar, Tiempo cumplido y Por cobrar (los tres últimos aparecen cuando hay alguna).
- [ ] El botón de tema del muro pasa por Sistema → Claro → Oscuro; en Caja › Apariencia se elige igual, y la elección se mantiene al cerrar y reabrir.
- [ ] En los dos temas todo se lee bien: textos, franjas, vuelto y avisos.
- [ ] La tarjeta se hunde un poco al tocarla; al filtrar por tipo las tarjetas se reacomodan suave.
- [ ] El diálogo de nueva sesión se cierra con la X, el botón "Iniciar sesión" queda fijo abajo y los totales cambian al elegir mandos y modalidad.
- [ ] "Finalizar sesión" y "Cerrar turno" piden confirmación en un diálogo que aparece con una transición corta y se puede cancelar tocando fuera.
- [ ] Las herramientas de desarrollo se ven con el mismo estilo que el resto.

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
