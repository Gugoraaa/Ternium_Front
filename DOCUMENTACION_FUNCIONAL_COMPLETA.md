# Documentacion Funcional Completa - Ternium Front

## 1. Proposito general

Esta aplicacion es el frontend operativo de Ternium para gestionar el ciclo completo de una orden:

1. Captura de la orden.
2. Revision del cliente.
3. Contraoferta o ajuste de especificaciones.
4. Aprobacion de gestion.
5. Programacion de ejecucion.
6. Registro operativo en planta.
7. Validacion para despacho.
8. Generacion de despacho.
9. Seguimiento de entrega.

Ademas, la app incluye:

- autenticacion con Supabase,
- control de acceso por roles,
- dashboard con KPIs por perfil,
- administracion de usuarios,
- leaderboard interno de desempeno,
- simulacion 3D de tarima para validar especificaciones de empaque y acomodo.

## 2. Stack y arquitectura

### Frontend

- Next.js 16 con App Router.
- React 19.
- Tailwind CSS 4.
- `react-hot-toast` para notificaciones.
- `react-icons` para iconografia.

### Datos y autenticacion

- Supabase para autenticacion.
- Supabase como fuente principal de datos.
- La mayoria de consultas se hacen directamente desde el frontend a tablas de Supabase.

### Visualizacion especializada

- `three`
- `@react-three/fiber`
- `@react-three/drei`
- `leaflet`
- `react-leaflet`

### Arquitectura funcional

- La app usa rutas protegidas.
- Hay un layout privado para `/ternium/*`.
- El estado del usuario autenticado y su rol se obtiene desde Supabase.
- La navegacion cambia segun el rol del usuario.
- Cada modulo consulta y actualiza informacion directamente en la base de datos.

## 3. Rutas existentes

### Rutas publicas

- `/`
  - Redirige a `/login`.
- `/login`
  - Pantalla de acceso.

### Rutas privadas

- `/ternium`
  - Pantalla de bienvenida basica.
- `/ternium/dashboard`
  - Dashboard principal.
- `/ternium/leaderboard`
  - Ranking interno de usuarios.
- `/ternium/usuarios`
  - Listado y administracion de usuarios.
- `/ternium/usuarios/crearusuario`
  - Alta de usuario.
- `/ternium/clientes`
  - Seguimiento de ordenes del cliente.
- `/ternium/clientes/orden/[slug]`
  - Detalle de orden desde la vista cliente.
- `/ternium/gestion`
  - Gestion de ordenes.
- `/ternium/gestion/crearpedido`
  - Creacion de nueva orden.
- `/ternium/gestion/orden/[slug]`
  - Detalle de orden desde gestion.
- `/ternium/programacion`
  - Programacion de ordenes.
- `/ternium/programacion/editar/[slug]`
  - Alta o edicion de asignacion.
- `/ternium/operaciones`
  - Listado operativo.
- `/ternium/operaciones/orden/[slug]`
  - Registro de ejecucion y validacion tecnica.
- `/ternium/management`
  - Validacion para despacho.
- `/ternium/management/orden/[slug]`
  - Detalle de validacion de despacho.
- `/ternium/despacho`
  - Logistica y despacho.
- `/ternium/despacho/gestionar/[slug]`
  - Generacion de orden de despacho.
- `/ternium/despacho/orden/[slug]`
  - Seguimiento de despacho y entrega.

### Estados de carga

Existen pantallas `loading.tsx` para:

- gestion,
- programacion,
- operaciones,
- management,
- despacho.

Esto significa que la app contempla estados visuales de espera durante la carga de datos.

## 4. Autenticacion y sesion

La app hace lo siguiente en autenticacion:

- permite iniciar sesion con correo y contrasena,
- muestra errores de credenciales incorrectas,
- permite mostrar u ocultar la contrasena,
- redirige a dashboard cuando el login es exitoso,
- si ya existe sesion activa, evita volver al login,
- protege las rutas privadas bajo `/ternium`,
- permite cerrar sesion desde la barra lateral.

### Comportamiento de acceso

- Si un usuario no autenticado intenta entrar al layout privado, es redirigido a `/login`.
- Si un usuario entra a una ruta no permitida para su rol, se le redirige a `/ternium/dashboard`.
- El middleware de Supabase mantiene actualizada la sesion.

## 5. Roles y permisos

### Roles con permisos declarados

- `admin`
  - acceso total.
- `user_admin`
  - dashboard, usuarios, leaderboard.
- `client_manager`
  - dashboard, clientes, leaderboard.
- `order_manager`
  - dashboard, gestion, leaderboard.
- `operations_manager`
  - dashboard, operaciones, leaderboard.
- `scheduler`
  - dashboard, programacion, leaderboard.
- `order_controller`
  - dashboard, management, leaderboard.

### Observaciones

- En componentes de interfaz aparece tambien el rol `dispatcher`, pero no esta incluido en el mapa activo de permisos.
- El menu lateral se construye dinamicamente segun el rol autenticado.

## 6. Flujo funcional principal de la orden

### Flujo nominal

1. Se crea una orden desde Gestion.
2. El cliente revisa la orden desde Clientes.
3. El cliente puede:
   - aceptarla,
   - rechazarla,
   - solicitar revision con cambios.
4. Gestion revisa la orden:
   - aprueba la orden sin cambios,
   - acepta una contraoferta,
   - rechaza la orden o contraoferta.
5. Programacion asigna la orden a un responsable.
6. Operaciones registra datos reales de ejecucion.
7. Operaciones valida la especificacion ejecutada.
8. Management valida si la orden puede pasar a despacho.
9. Despacho genera la orden de salida.
10. La orden pasa a `En ruta`.
11. La orden puede marcarse como `Entregado`.

## 7. Funcionalidades por modulo

## 7.1. Inicio y acceso

### Login

La pantalla de login permite:

- capturar correo electronico,
- capturar contrasena,
- mostrar u ocultar contrasena,
- iniciar sesion con Supabase,
- mostrar error si las credenciales fallan,
- bloquear el boton mientras el login esta en progreso.

### Redirecciones iniciales

- `/` siempre redirige a `/login`.
- si ya hay sesion activa en login, redirige a `/ternium/dashboard`.

## 7.2. Layout privado y navegacion

### Sidebar

La barra lateral permite:

- navegar entre modulos,
- mostrar solo los modulos autorizados por rol,
- colapsar y expandir la barra,
- mostrar nombre y rol del usuario,
- cerrar sesion.

### Layout privado

El layout privado agrega:

- sidebar persistente,
- contenedor principal con scroll,
- accesibilidad basica con salto a contenido principal,
- notificaciones toast globales.

## 7.3. Dashboard

El dashboard cambia segun el rol del usuario.

### Funciones generales del dashboard

- obtener nombre del usuario autenticado,
- mostrar KPIs por rol,
- mostrar alertas operativas,
- mostrar acciones rapidas,
- mostrar ordenes recientes,
- mostrar modulo recomendado segun rol.

### Dashboard para `order_manager` y `admin`

KPIs:

- pendientes de revision,
- aceptadas esta semana,
- contraofertas activas,
- ordenes del mes.

Alertas:

- ordenes rechazadas con mas de 3 dias sin atencion,
- contraofertas pendientes.

Acciones rapidas:

- revisar pendientes,
- crear nueva orden.

### Dashboard para `scheduler`

KPIs:

- ordenes sin asignar,
- ordenes asignadas hoy,
- reasignaciones,
- ordenes asignadas esta semana.

Alertas:

- ordenes sin asignar.

Acciones rapidas:

- ver programacion.

### Dashboard para `operations_manager`

KPIs:

- ejecuciones activas,
- pendientes de validar,
- rechazadas,
- completadas.

Alertas:

- ejecuciones rechazadas que requieren correccion.

Acciones rapidas:

- ver operaciones.

### Dashboard para `order_controller`

KPIs:

- despachos pendientes,
- aprobados hoy,
- rechazados esta semana,
- procesados este mes.

Alertas:

- despachos pendientes de validacion.

Acciones rapidas:

- validar despachos.

### Dashboard para `client_manager`

KPIs:

- ordenes activas de sus clientes,
- ordenes en revision,
- ordenes completadas.

Acciones rapidas:

- ver ordenes de clientes.

### Dashboard para `user_admin`

KPIs:

- usuarios activos,
- total de ordenes,
- pendientes de revision,
- nuevos usuarios del mes.

Acciones rapidas:

- gestionar usuarios,
- crear usuario.

## 7.4. Modulo de Gestion de Ordenes

### Pantalla principal

La vista de gestion permite:

- ver listado de ordenes generadas,
- filtrar por estado,
- filtrar por cliente,
- buscar por ID,
- limpiar filtros,
- ver total de registros,
- entrar al detalle de la orden,
- navegar a la creacion de una nueva orden.

### Estados de orden visibles en la interfaz

- `Revision Operador`
- `Revision Cliente`
- `Aceptado`
- `Rechazado`

### Crear nueva orden

La pantalla de captura permite:

- capturar producto,
- capturar `Master ID`,
- capturar cliente,
- autocompletar cliente desde la tabla `clients`,
- autocompletar producto desde la tabla `product`,
- autocompletar master segun el producto seleccionado,
- generar especificaciones desde la tabla `specs`,
- visualizar progreso del formulario,
- validar que la especificacion haya sido confirmada,
- generar la orden en la tabla `orders`,
- asociar:
  - `worker_id`,
  - `client_id`,
  - `product_id`,
  - `specs_id`,
- limpiar el formulario tras exito,
- redirigir al listado de gestion.

### Simulacion de tarima en creacion

En la creacion de orden se puede:

- elegir orientacion del rollo:
  - `vertical`,
  - `horizontal`,
- ver la simulacion 3D de la tarima,
- ver metricas derivadas de acomodo,
- ver nivel de riesgo del acomodo.

### Detalle de orden desde Gestion

La vista detalle permite:

- consultar informacion completa de la orden,
- ver producto, cliente y especificaciones,
- detectar si existe contraoferta,
- obtener la contraoferta del cliente,
- ver comentario del cliente,
- comparar especificacion original vs contraoferta,
- mostrar comparacion visual de tarimas,
- aprobar una orden sin contraoferta,
- rechazar una orden,
- aceptar una contraoferta.

### Aceptar orden desde Gestion

Cuando Gestion acepta:

- la orden cambia a `Aceptado`,
- se marca `reviewed = true`,
- se guarda `reviewed_by`,
- si hay contraoferta:
  - se crean nuevas `specs`,
  - la orden se enlaza a esas nuevas especificaciones.

### Rechazar orden desde Gestion

- la orden cambia a `Rechazado`.

## 7.5. Modulo de Clientes

### Listado de clientes

La vista de clientes permite:

- ver ordenes del cliente asignado,
- si el usuario es `admin`, ver todas las ordenes,
- buscar por:
  - ID,
  - producto,
  - cliente,
- ver totales de ordenes pendientes,
- ver ordenes en revision,
- entrar al detalle de cada orden.

### Obtencion de ordenes del cliente

Para `client_manager`, la app:

- obtiene el usuario autenticado,
- busca su relacion en `client_workers`,
- localiza el `client_id` asociado,
- trae solo las ordenes de ese cliente.

### Detalle de orden desde Clientes

La vista del cliente permite:

- ver informacion general de la orden,
- ver especificaciones originales,
- editar los campos si la orden esta en `Revision Cliente`,
- restaurar valores originales,
- agregar nota del cliente,
- cambiar orientacion del rollo para la simulacion,
- ver simulacion 3D de tarima,
- detectar y resaltar campos modificados,
- ver tabla comparativa de cambios,
- mostrar advertencia de impacto operativo/logistico por cambios,
- aceptar la orden,
- rechazar la orden,
- solicitar revision.

### Campos editables por el cliente

El cliente puede modificar:

- diametro interno,
- diametro externo,
- ancho,
- peso minimo,
- peso maximo,
- piezas por paquete,
- ancho maximo de tarima,
- embalaje,
- orientacion del rollo,
- nota del cliente.

### Validaciones antes de solicitar revision

La app valida:

- diametro interno >= 1,
- diametro externo >= 1,
- diametro externo > diametro interno,
- ancho >= 1,
- peso minimo > 0,
- peso maximo > 0,
- peso maximo >= peso minimo,
- piezas por paquete entero y > 0,
- ancho maximo de tarima >= 1.

### Solicitar revision

Cuando el cliente solicita revision:

- se detecta si hubo cambios reales,
- se crea un registro en `order_offers_specs`,
- se crea un registro en `order_offers`,
- se guarda la nota del cliente,
- la orden se marca con `contra_offer = true`,
- la orden cambia a `Revision Operador`.

### Aceptar desde cliente

Si el cliente acepta:

- la orden cambia a `Aceptado`,
- se marca `reviewed = true`,
- se guarda `reviewed_by`.

### Rechazar desde cliente

Si el cliente rechaza:

- la orden cambia a `Rechazado`.

## 7.6. Modulo de Programacion

### Pantalla principal

La vista de programacion permite:

- ver ordenes aceptadas,
- filtrar por estado de asignacion,
- filtrar por cliente,
- filtrar por responsable,
- paginar resultados,
- entrar a editar o crear asignacion,
- ver:
  - producto,
  - cliente,
  - estado administrativo,
  - responsable,
  - fecha asignada,
  - estado de asignacion.

### Estados de programacion

- `Sin asignar`
- `Asignado`
- `Reasignado`

### Crear o editar asignacion

La pantalla de edicion permite:

- cargar datos de la orden,
- obtener lista de trabajadores activos,
- seleccionar responsable,
- seleccionar fecha limite,
- agregar comentario de programacion,
- guardar la asignacion,
- actualizar `programing_instructions` con:
  - `responsible`,
  - `assigned_date`,
  - `note`,
  - `status = Asignado`.

### Datos auxiliares de Programacion

La app incluye una funcion de apoyo para:

- crear o actualizar programacion con `upsert`,
- enlazar `programing_instructions_id` a la orden.

Esa capacidad existe en el codigo, aunque la pantalla principal usa la vista de edicion dedicada como flujo principal.

## 7.7. Modulo de Operaciones

### Pantalla principal

La vista de operaciones permite:

- ver ordenes ya asignadas,
- filtrar por estado de asignacion,
- filtrar por cliente,
- limpiar filtros,
- paginar resultados,
- entrar al detalle operativo,
- ver:
  - producto,
  - cliente,
  - responsable,
  - peso minimo especificado,
  - estado de ejecucion.

### Estados de ejecucion

- `Pendiente`
- `Aceptado`
- `Rechazado`

### Detalle operativo

La pantalla de detalle permite:

- ver datos generales de la orden,
- ver responsable y fecha de asignacion,
- alternar entre tabs:
  - `Especificacion`,
  - `Registro de Operacion`,
- consultar las especificaciones tecnicas,
- capturar:
  - peso real,
  - tipo de embalaje,
  - nota de operacion,
- guardar datos de ejecucion,
- validar especificacion,
- ver datos de envio si ya existen.

### Comportamiento tecnico del detalle operativo

- Si la orden no tiene `execution_details`, la app lo crea automaticamente con estado `Pendiente`.
- Al guardar, actualiza el registro de ejecucion.
- Al validar:
  - guarda los datos,
  - cambia `execution_details.status` a `Aceptado`,
  - crea un registro `dispatch_validation` con estado `Pendiente`,
  - enlaza `dispatch_validation_id` a la orden.

### Validaciones operativas

- el peso real debe ser al menos 1 tonelada para poder validarse.

## 7.8. Modulo de Management

Este modulo funciona como control logistico previo a despacho.

### Pantalla principal

Permite:

- ver ordenes listas para validacion de despacho,
- filtrar por estado de despacho,
- restablecer filtros,
- paginar resultados,
- entrar al detalle de validacion.

### Estados de validacion de despacho

- `Pendiente`
- `Aceptado`
- `Rechazado`

### Detalle de validacion

La vista detalle permite:

- ver informacion general de la orden,
- ver estado actual de validacion,
- comparar:
  - peso minimo especificado vs peso ejecutado,
  - peso maximo especificado,
  - embalaje especificado vs ejecutado,
  - nota de ejecucion,
- ver reglas de despacho,
- aprobar para despacho,
- rechazar validacion.

### Aprobar para despacho

Cuando se aprueba:

- `dispatch_validation.status` cambia a `Aceptado`,
- se guarda `approved_at`,
- si no existe `shipping_info`:
  - se crea con estado `Pendiente`,
  - se enlaza a la orden mediante `shipping_info_id`.

### Rechazar validacion

Cuando se rechaza:

- `dispatch_validation.status` cambia a `Rechazado`.

## 7.9. Modulo de Despacho

### Pantalla principal

Permite:

- ver ordenes de despacho,
- filtrar por estado de envio,
- restablecer filtros,
- paginar resultados,
- entrar a:
  - gestionar entrega,
  - ver ruta,
  - ver detalle.

### Estados de envio

- `Pendiente`
- `En ruta`
- `Entregado`
- `Rechazado`
- `Activos` como filtro compuesto de:
  - `Pendiente`
  - `En ruta`

### Gestionar despacho

La vista `gestionar/[slug]` permite:

- revisar datos tecnicos previos a la salida,
- mostrar:
  - cliente,
  - producto,
  - master,
  - peso neto,
  - total de piezas,
  - embalaje,
  - peso minimo,
  - peso maximo,
  - ancho maximo de tarima,
- generar la orden de despacho.

### Generar orden de despacho

Cuando se genera:

- `shipping_info.status` cambia de `Pendiente` a `En ruta`.

### Seguimiento de despacho

La vista `orden/[slug]` permite:

- ver cabecera de orden de despacho,
- ver estado de envio,
- mostrar mapa de ruta,
- mostrar datos de envio,
- mostrar fechas importantes,
- marcar una orden como entregada.

### Marcar orden entregada

Cuando se marca:

- `shipping_info.status` cambia a `Entregado`,
- se guarda `shipped_at`.

### Mapa

La app muestra:

- un mapa Leaflet,
- centrado en Monterrey, Nuevo Leon,
- con un marcador fijo de punto de entrega.

## 7.10. Modulo de Usuarios

### Pantalla principal

La administracion de usuarios permite:

- listar usuarios,
- buscar por nombre,
- buscar por correo,
- buscar por rol,
- ver rol asignado,
- ver fecha de registro,
- ver estado activo/inactivo,
- abrir menu de acciones por usuario.

### Acciones por usuario

Desde la tabla se puede:

- activar usuario,
- desactivar usuario,
- cambiar rol,
- eliminar usuario.

### Crear usuario

La pantalla de alta permite:

- crear usuario interno,
- crear usuario externo,
- cargar roles disponibles,
- cargar clientes disponibles,
- capturar datos generales,
- validar campos obligatorios,
- validar longitud minima de contrasena,
- crear cuenta con `supabase.auth.signUp`,
- guardar metadata de usuario:
  - `name`,
  - `second_name`,
  - `role_id`,
- si es usuario externo:
  - vincularlo con un cliente en `client_workers`,
- redirigir al listado al terminar.

### Tipos de usuario contemplados

- empleado interno,
- usuario externo asociado a cliente.

## 7.11. Leaderboard

La app incluye un ranking interno con dos modos:

- trabajadores de planta,
- gestores de ordenes.

### Funciones del leaderboard

- cambiar periodo:
  - ultimos 7 dias,
  - ultimos 30 dias,
  - historico,
- cambiar entre tabs,
- mostrar podio top 3,
- mostrar tabla completa,
- calcular puntaje compuesto automaticamente.

### Logica para trabajadores

Se calcula con datos de `programing_instructions.responsible`.

Mide:

- total de asignaciones,
- reasignaciones,
- score compuesto por volumen y menor tasa de reasignacion.

### Logica para gestores

Se calcula con datos de `orders.reviewed_by`.

Mide:

- total revisado,
- aceptadas,
- rechazadas,
- score compuesto por volumen y tasa de aceptacion.

## 7.12. Simulacion de Tarima

Esta es una de las funciones mas distintivas del proyecto.

### Capacidades de la simulacion

- visualizar tarima en 3D,
- simular acomodo de rollos,
- soportar orientacion:
  - vertical,
  - horizontal,
- comparar tarima original contra contraoferta,
- mostrar metricas derivadas,
- mostrar nivel de riesgo,
- mostrar advertencias y violaciones.

### Datos que usa la simulacion

- diametro interno,
- diametro externo,
- ancho,
- peso maximo,
- piezas por paquete,
- ancho maximo de tarima,
- embalaje,
- orientacion del rollo.

### Reglas funcionales de tarima

#### Ojo vertical

- peso maximo por tarima: 6 toneladas,
- altura maxima: 1700 mm,
- apila piezas en columnas,
- distribuye columnas lateralmente.

#### Ojo horizontal

- peso maximo por tarima: 20 toneladas,
- usa ancho maximo de tarima especificado o 1500 mm por defecto,
- acomoda piezas en una sola fila,
- usa cunas de soporte,
- valida si caben todas las piezas.

### Niveles de riesgo

- `SEGURO`
- `OBSERVACION`
- `RIESGOSO`
- `NO_PERMITIDO`

### Que evalua la simulacion

- peso total,
- altura total,
- ancho total,
- numero de piezas que caben,
- cercania a limites de seguridad,
- violaciones duras de negocio.

### Casos que generan advertencia o bloqueo

- peso cercano al limite,
- peso por encima del limite,
- altura cercana al limite,
- altura por encima del limite,
- ancho cercano al limite,
- ancho por encima del limite,
- piezas que no caben en una fila.

## 8. Tablas y entidades utilizadas

La app hace uso funcional de estas entidades:

- `users`
  - usuarios del sistema.
- `roles`
  - roles y permisos.
- `clients`
  - clientes.
- `client_workers`
  - relacion entre usuario externo y cliente.
- `orders`
  - orden principal.
- `product`
  - catalogo de productos.
- `specs`
  - especificaciones base.
- `order_offers`
  - contraofertas del cliente.
- `order_offers_specs`
  - especificaciones propuestas en contraoferta.
- `programing_instructions`
  - asignacion y programacion de la orden.
- `execution_details`
  - datos reales de ejecucion.
- `dispatch_validation`
  - validacion previa a despacho.
- `shipping_info`
  - estado e informacion de envio.

## 9. Estados y transiciones principales

### Orden

Estados observados:

- `Revision Operador`
- `Revision Cliente`
- `Aceptado`
- `Rechazado`

Transiciones observadas:

- nueva orden -> `Revision Cliente` o flujo equivalente de revision,
- cliente solicita revision -> `Revision Operador`,
- cliente acepta -> `Aceptado`,
- gestion acepta -> `Aceptado`,
- cliente o gestion rechazan -> `Rechazado`.

### Programacion

- `Sin asignar`
- `Asignado`
- `Reasignado`

### Ejecucion

- `Pendiente`
- `Aceptado`
- `Rechazado`

### Validacion de despacho

- `Pendiente`
- `Aceptado`
- `Rechazado`

### Envio

- `Pendiente`
- `En ruta`
- `Entregado`
- `Rechazado`

## 10. Validaciones funcionales implementadas

### En creacion y revision de especificaciones

- producto, master y cliente obligatorios,
- especificacion obligatoria antes de generar orden,
- confirmacion obligatoria antes de crear orden.

### En contraofertas de cliente

- validacion de diametros,
- validacion de ancho,
- validacion de pesos,
- validacion de piezas por paquete,
- validacion de ancho maximo de tarima.

### En operacion

- peso real minimo de 1 tonelada al validar.

### En flujo de despacho

- no se puede generar despacho si la orden no tiene `shipping_info`,
- no se puede generar despacho si ya no esta `Pendiente`,
- no se puede marcar como entregada si no esta `En ruta`,
- management no puede procesar una validacion ya atendida.

## 11. Elementos visuales o funcionalidad parcial / mock

Estas funciones existen en interfaz, pero hoy no estan completas o no persisten:

### Funciones visuales o deshabilitadas

- boton `Exportar` en usuarios:
  - visible,
  - deshabilitado,
  - marcado como "Proximamente".
- botones de descargar e imprimir en gestion:
  - visibles,
  - deshabilitados,
  - marcados como "Proximamente".
- icono de descarga en programacion:
  - visible,
  - sin logica conectada.
- boton `Descargar PDF` en detalle de gestion:
  - visible,
  - sin implementacion real.

### Datos mock o visuales en despacho

En la gestion de despacho se generan visualmente:

- empresa transportista,
- guia de remision,
- TAR,
- placas.

El propio codigo indica que esos datos:

- son visuales,
- no se persisten en la base de datos.

### Mapa de despacho

- muestra una ubicacion fija en Monterrey,
- no hay geolocalizacion en vivo,
- no hay tracking real del transporte.

## 12. Observaciones tecnicas relevantes

- El proyecto casi no tiene documentacion en `README`, por lo que la documentacion funcional se obtuvo directamente del codigo.
- Existe un cliente Axios (`src/lib/api.ts`), pero no forma parte del flujo principal actual; la aplicacion usa mayormente Supabase directo.
- La interfaz contempla un rol `dispatcher` en etiquetas visuales, pero ese rol no aparece habilitado en el mapa principal de permisos.

## 13. Resumen ejecutivo

En su estado actual, la app ya cubre de punta a punta el flujo principal de una orden industrial:

- captura,
- revision,
- contraoferta,
- aprobacion,
- programacion,
- ejecucion,
- validacion para salida,
- despacho,
- entrega.

Tambien cubre funciones de soporte importantes:

- autenticacion,
- control por roles,
- administracion de usuarios,
- metricas por perfil,
- ranking interno,
- simulacion 3D de tarima para validar decisiones tecnicas.

Lo que aun se ve incompleto o parcial se concentra sobre todo en:

- exportaciones,
- PDF,
- impresion,
- datos logisticos mock,
- rastreo de mapa no dinamico.
