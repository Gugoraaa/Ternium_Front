# Valor de negocio — Crear pedido / captura de orden (Ternium Gestión)

Este documento resume **qué hace** el flujo de **Crear pedido** en la aplicación (`/ternium/gestion/crearpedido`) y **cómo se relaciona** con las preguntas típicas de valor de negocio. Sirve como contexto para redactar respuestas ejecutivas, propuestas o mediciones posteriores.

**Referencia técnica principal:** `src/app/ternium/gestion/crearpedido/page.tsx`  
**Validación de tarima (riesgo operativo / bloqueos):** `src/lib/tarima/validations.ts` y simulación asociada en `src/lib/tarima/`.

---

## 1. Qué problema resuelve el módulo

El usuario operativo captura una **orden** enlazando:

- **Cliente** (desde tabla `clients`, con búsqueda y selección obligatoria de un registro válido).
- **Producto terminado (PT)** y **Master ID** (desde tabla `product`, con autocompletado).
- **Especificación técnica** asociada al producto (tabla `specs`): diámetros, pesos de envío, piezas por paquete, ancho de tarima, embalaje, etc.

Luego:

1. Puede ajustar **orientación del rollo** (ojo vertical / horizontal) y ver una **previsualización de tarima** (`TarimaPanel`).
2. El sistema aplica **reglas de validación de tarima** (`getTarimaSubmissionGuard`): advertencias y **bloqueos** que impiden generar la orden si hay incumplimientos duros.
3. Tras confirmar con checkbox la revisión de parámetros, se **persiste** la orden en `orders` (con `worker_id`, `client_id`, `product_id`, `specs_id`). Si la orientación difiere de la guardada en `specs`, se **clona** una fila nueva en `specs` con la orientación elegida antes de insertar la orden.

El panel de gestión (`/ternium/gestion`) enmarca el contexto: **seguimiento de órdenes**, validación y ciclo de gestión; el botón **Crear Nueva Orden** navega a este flujo.

---

## 2. Mapa a las preguntas de valor (con evidencia en el producto)

Las respuestas concretas del tipo “35 %”, “18 %” **no están en el código**: deben salir de **medición** (tiempos antes/después, incidencias, encuestas, datos de ERP, etc.). Aquí va **qué sí se puede afirmar** con base en la funcionalidad implementada.

### ¿Ahorra dinero?

**Ángulos defendibles con el diseño actual:**

- Menos riesgo de **reproceso y costos logísticos** al bloquear envíos de orden con tarima inválida (errores detectados antes de comprometer producción/despacho).
- **Trazabilidad**: la UI deja explícita la “confirmación digital” y la asociación usuario–orden en base de datos (`worker_id`, specs clonadas cuando cambia orientación), lo que facilita auditoría y atribución de desviaciones (menor costo de investigación y disputas internas).

**Para cuantificar:** costo promedio de una incidencia de embalaje/tarima corregida, horas de coordinación evitadas, multas o mermas asociadas a errores de especificación.

---

### ¿Reduce tiempos?

**Sí, en el sentido de eficiencia operativa:**

- **Búsqueda asistida** de cliente, PT y Master (listas desde Supabase, sin reescribir códigos a mano sin validación).
- **Carga automática de especificación** al acoplar PT + Master correctos (“Generar Especificación” consulta `product` y `specs` en una secuencia guiada).
- **Flujo único** con barra de progreso y checklist (Datos base → Especificación → Validación final), orientado a completar el pedido sin saltar pasos críticos.

**Para cuantificar:** tiempo medio desde inicio de captura hasta orden creada (con y sin herramienta), o número de consultas a catálogos externos evitadas.

---

### ¿Incrementa ventas?

**Con matices.** Este flujo es **captura y formalización de órdenes B2B/operativas**, no un canal de e-commerce clásico.

- **Efecto plausible:** mayor **capacidad de procesamiento** de pedidos por el mismo equipo (más órdenes cerradas en la misma ventana de tiempo si el cuello de botella era la captura manual).
- **No afirmar sin datos:** “incremento de conversión %” tipo retail suele requerir embudo de ventas y CRM; aquí el indicador natural es **throughput de órdenes válidas** o **reducción de pedidos rechazados por datos incompletos**.

---

### ¿Mejora la experiencia del cliente?

**Cliente interno (operador / gestión):**

- Interfaz clara, validaciones inmediatas (toasts), estados de carga, checklist y bloqueo del botón “Generar Orden” hasta cumplir reglas (`isChecked`, `clienteId`, `tarimaGuard.canSubmit`, etc.).

**Cliente externo (comprador / receptor):**

- Indirectamente: especificaciones **consistentes con catálogo** y límites logísticos visibles antes de confirmar; menos ambigüedad sobre embalaje y geometría de envío.

**Para cuantificar:** NPS o satisfacción del área comercial/operaciones, tickets por error de datos en pedido, tiempo de ida y vuelta con el cliente por correcciones.

---

### ¿Automatiza procesos?

**Sí, en varios puntos:**

- **Resolución de producto y specs** desde base de datos en lugar de copiar manualmente fichas técnicas.
- **Simulación / validación de tarima** integrada en la pantalla (no solo texto estático).
- **Clonación de `specs`** cuando cambia la orientación respecto al registro original, preservando consistencia sin editar a mano múltiples tablas en la cabeza del usuario.
- **Persistencia estructurada** del pedido con relaciones normalizadas (`orders` + `specs_id`).

---

### ¿Reduce errores?

**Sí, de forma explícita:**

- Cliente debe **elegirse de la lista** (no basta texto libre): se exige `clienteId` para generar la orden.
- **Validación de tarima** separa **advertencias** y **bloqueos**; sin `canSubmit` no se envía el pedido.
- Checkbox de **confirmación de revisión** antes de generar la orden (compromiso explícito frente a parámetros mostrados).
- Mensajes de error guiados: especificación faltante, producto no encontrado, validación previa obligatoria.

**Para cuantificar:** tasa de órdenes devueltas o reprocesadas por datos incorrectos antes vs. después; número de bloqueos `tarimaGuard` que evitaron un envío inválido (si se registran en analytics o logs).

---

## 3. Ejemplos de redacción (plantillas — reemplazar con mediciones reales)

Usar solo después de tener **datos**; los porcentajes siguientes son **ilustrativos** del formato solicitado por la empresa, no inferidos del repositorio.

| Afirmación (ejemplo) | Qué medir |
|----------------------|-----------|
| “Reduce tiempos de captura de pedido en un X %” | Cronometraje o muestra de tickets por pedido |
| “Disminuye incidencias de embalaje/tarima en un Y %” | Registro de no conformidades o devoluciones |
| “Incrementa el volumen de órdenes procesadas sin aumentar headcount en un Z %” | Órdenes creadas / FTE / mes |

---

## 4. Limitaciones y supuestos (honestidad en valor de negocio)

- La calidad del dato **depende del catálogo** (`product`, `specs`, `clients`): si el maestro de datos está desactualizado, la herramienta acelera pero **replica** esos errores.
- Los **porcentajes de negocio** requieren línea base histórica; el código no expone KPIs.
- El alcance de este documento es el **front de captura**; impactos en planta, transporte o facturación dependen de procesos y sistemas aguas abajo.

---

## 5. Resumen en una frase

**Crear pedido** digitaliza y estandariza la captura de órdenes con datos maestros, visualización de tarima y validaciones que **bloquean envíos inválidos**, mejorando **velocidad, consistencia y trazabilidad**; el ahorro económico y los porcentajes deben **medirse** en operación, no deducirse solo del código.
