# Flujo de git

## Ramas

| Rama | Uso |
|---|---|
| `main` | Estable. Solo por pull request desde `develop`. |
| `develop` | Integración. Solo por pull request desde una feature. |
| `feature/T0X-nombre` | Una por tarea. Ejemplos: `feature/T10-cronometro-persistente`, `feature/T03-esquema-sqlite`. |

## Commits

Formato: `tipo(T0X): descripción en minúsculas y en presente`

| Tipo | Cuándo se usa |
|---|---|
| `feat` | Se agrega una funcionalidad |
| `fix` | Se corrige un error |
| `docs` | Cambios solo de documentación |
| `refactor` | Se reorganiza código sin cambiar su comportamiento |
| `test` | Se agregan o ajustan pruebas |
| `chore` | Configuración, herramientas y mantenimiento |

Ejemplos:
- `feat(T10): calcular tiempo transcurrido desde started_at`
- `fix(T03): corregir tipo de la columna started_at`
- `docs(T01): agregar diagrama de capas`

## Flujo de seis pasos

1. Crear la rama desde `develop`.
2. Hacer commits pequeños.
3. Abrir el pull request hacia `develop` con la plantilla.
4. Revisión por otro integrante.
5. Mover la tarea en Jira a "En revisión" al abrir el pull request y a "Listo" al fusionar.
6. Borrar la rama de la feature después de fusionar (ver "Limpieza de ramas").

## Limpieza de ramas

Cada rama `feature/T0X-nombre` se borra al fusionar su pull request. Su contenido queda en `develop` y el historial en el pull request.

- En GitHub: activar "Automatically delete head branches" en Settings → General, para que se borre sola al fusionar.
- En local, después de fusionar:

```bash
git switch develop && git pull
git branch -d feature/T0X-nombre
git fetch --prune
```

- Nunca se borran `main` ni `develop`.

## Reglas de revisión

- Quien abre el pull request no lo aprueba.
- Mínimo 1 aprobación.
- Revisión en menos de 1 día hábil.
- Se usa la lista de revisión de la plantilla.

## Definition of Done

- [ ] Rama propia.
- [ ] Pull request revisado y aprobado por otro integrante.
- [ ] Probado contra los criterios Given-When-Then de su historia.
- [ ] ESLint, tipos y pruebas sin errores.
- [ ] Fusionado a `develop`.
- [ ] Rama de la feature borrada.
- [ ] Tarea en "Listo" en Jira.
