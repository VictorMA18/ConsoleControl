# Guion de la Sprint Review

| Campo               | Valor                                                                         |
| ------------------- | ----------------------------------------------------------------------------- |
| Tarea               | T21 (TW-21) · TW-141 y TW-142                                                 |
| Conduce             | VN                                                                            |
| Fecha de la reunión | 18/11/2026 (acta en [`acta-sprint-review.md`](acta-sprint-review.md))         |
| Requisito           | APK de T19 instalado (build 9ee60139, ver [`generar-apk.md`](generar-apk.md)) |

## Antes de empezar

- Instalar el APK y abrirlo una vez.
- Tener la app en estado inicial, sin sesiones activas.
- Tener a la vista el tarifario vigente.
- Confirmar que el celular tiene hora automática.

## Orden de la demostración

### 1. HU-001 · Apertura de sesión

**Qué mostrar:** iniciar una sesión en máximo 2 toques.

1. Abrir el muro y señalar las consolas disponibles.
2. Tocar una consola, elegir mandos y modalidad, y pulsar "Iniciar Sesión".
3. Intentar abrir otra sesión en la misma consola: se bloquea e informa el motivo.
4. Pedir más mandos de los disponibles: la app sugiere otra consola.

**Pregunta:** ¿esto reemplaza lo que hoy anota en el cuaderno? ¿Falta algún dato?

### 2. HU-002 · Cronómetro persistente

**Qué mostrar:** el tiempo no se pierde.

1. Con la sesión activa, minimizar la app y volver.
2. Cerrar la app y abrirla: la sesión reaparece con el tiempo real.
3. Señalar los colores: verde, rojo y ámbar.

**Pregunta:** ¿los colores se distinguen bien en el ciber? ¿Confía en el tiempo que muestra?

### 3. HU-003 · Tarificación por mandos

**Qué mostrar:** el total se calcula solo.

1. Abrir el diálogo de una consola libre.
2. Cambiar los mandos y la modalidad, y ver el total estimado.

**Pregunta:** ¿estos precios y el recargo coinciden con lo que cobra hoy?

### 4. HU-004 · Alerta de vencimiento

**Qué mostrar:** el aviso 5 minutos antes y el estado "Tiempo Cumplido". Para no esperar, preparar antes una sesión `fijo_30` que esté cerca de vencer.

1. Mostrar el ámbar titilante y la vibración.
2. Dejar vencer la sesión y mostrar "Tiempo Cumplido".

**Pregunta:** ¿5 minutos es suficiente? Hoy el aviso solo llega con la app abierta: ¿necesita recibirlo con la app cerrada?

## Retroalimentación del propietario

La retroalimentación quedó registrada en [`acta-sprint-review.md`](acta-sprint-review.md).
