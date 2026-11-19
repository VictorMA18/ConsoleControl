# Mejoras pendientes (ideas, sin planificar)

Cambios que VN quiere hacer más adelante. Todavía no tienen tarea en Jira ni fecha: se evalúan al planificar los sprints 2 y 3.

| Idea                                                                      | Qué cambia                                                                                                                                      | Pendiente antes de hacerla                                                                                                                                         |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Biblioteca **React Native Reusables** para los componentes de la interfaz | Reemplazar total o parcialmente los componentes propios (`ChoiceButton`, `TypeFilter`, tarjetas, diálogos)                                      | Es una dependencia fuera del stack: hace falta un ADR aprobado ([AGENTS.md](../../AGENTS.md) §7). Comprobar que encaja con NativeWind (ADR 0006) y con Expo SDK 58 |
| Colores en **HSL**                                                        | Definir los tokens de `tailwind.config.js` y de la guía de estilo en HSL en lugar de hexadecimal, para ajustar tono y luminosidad con facilidad | Repetir la comprobación de contraste de la [guía de estilo](../architecture/guia-de-estilo.md) (hoy 5.02, 6.47 y 6.97) y actualizar las variables de Figma         |

Cuando una idea se acepte, se crea su tarea en Jira y se registra el ADR que corresponda.
