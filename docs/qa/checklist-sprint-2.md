# Checklist manual del Sprint 2

Lo ejecuta VN en el celular, una sola vez, al final del sprint. Las casillas empiezan vacías.

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
