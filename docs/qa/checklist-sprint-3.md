# Checklist manual del Sprint 3

Lo ejecuta VN en el celular, una sola vez, al final del sprint, más una pasada de humo del flujo completo en un equipo de gama baja. Las casillas empiezan vacías.

## HU-009 · Extensión de tiempo

- [ ] Añadir 15 minutos a una sesión en juego: el cronómetro sigue sin reiniciarse.
- [ ] El vencimiento y el total estimado cambian.
- [ ] El aviso de 5 minutos llega con el vencimiento nuevo, no con el viejo.
- [ ] En una sesión de tiempo libre no aparece la opción.

## HU-012 · Semáforo de salud

- [ ] El semáforo muestra el color correcto por equipo.
- [ ] Reportar una falla en un mando lo saca de la asignación al iniciar una sesión.
- [ ] Una consola en mantenimiento no se puede iniciar.
- [ ] Volver a "operativo" la devuelve a la asignación.
- [ ] Las horas de uso suben después de cobrar una sesión.

## HU-014 · Alerta de mantenimiento

- [ ] Una consola con horas por debajo del umbral no muestra alerta.
- [ ] Al pasar el umbral aparece la alerta.
- [ ] Registrar el mantenimiento la quita.
- [ ] Las horas totales de la consola siguen intactas.

## HU-008 · Sincronización

> Antes: el `.env` con la URL y la clave publicable (ver `docs/guides/supabase.md`), «Allow anonymous sign-ins» activado en Supabase y `pnpm start --clear`.

- [ ] Sin internet (modo avión), iniciar, extender y cobrar una sesión funciona igual que siempre y sin demora.
- [ ] Sin `.env`, el indicador dice «Sin nube» y la app funciona igual.
- [ ] El indicador muestra «Pendiente (N)» con el número de registros.
- [ ] Al volver el internet, el indicador pasa a «Nube al día».
- [ ] En Supabase aparecen los registros, sin duplicados.
- [ ] Cortar el internet a mitad del envío y reconectar no duplica registros.
- [ ] Un turno cerrado sigue sin poder editarse, pero sus registros se sincronizan.
