# Ternium Front

Frontend operativo para gestionar el ciclo completo de una orden en Ternium, desde su captura hasta su despacho y entrega.

La aplicacion esta construida con Next.js y Supabase, y organiza el trabajo por roles para distintas areas del proceso:

- gestion de ordenes,
- clientes,
- programacion,
- operaciones,
- validacion para despacho,
- logistica y despacho,
- administracion de usuarios,
- dashboard y leaderboard.

## Que hace la app

La app permite:

- iniciar sesion y controlar acceso por roles,
- crear ordenes nuevas,
- consultar ordenes por modulo,
- revisar, aceptar o rechazar ordenes,
- gestionar contraofertas del cliente,
- programar responsables de ejecucion,
- registrar datos reales de operacion,
- validar ordenes antes del despacho,
- generar y seguir despachos,
- administrar usuarios y roles,
- visualizar KPIs y rankings internos,
- simular tarimas en 3D para validar acomodo y riesgo tecnico.

## Flujo principal

1. Se crea una orden desde `Gestion`.
2. El cliente revisa la orden desde `Clientes`.
3. El cliente puede aceptarla, rechazarla o solicitar revision con cambios.
4. `Gestion` aprueba la orden o acepta/rechaza la contraoferta.
5. `Programacion` asigna la orden a un responsable.
6. `Operaciones` registra la ejecucion real en planta.
7. `Management` valida si la orden puede pasar a despacho.
8. `Despacho` genera la salida y da seguimiento a la entrega.

## Modulos funcionales

### Login y acceso

- login con correo y contrasena,
- manejo de sesion con Supabase,
- proteccion de rutas privadas,
- cierre de sesion,
- redireccion automatica al dashboard.

### Dashboard

- KPIs por rol,
- alertas operativas,
- accesos rapidos,
- ordenes recientes,
- vista personalizada segun el perfil del usuario.

### Gestion de Ordenes

- listado de ordenes,
- filtros por estado, cliente e ID,
- creacion de nueva orden,
- obtencion de especificaciones desde catalogos,
- aprobacion y rechazo de ordenes,
- revision de contraofertas,
- comparacion entre especificacion original y propuesta del cliente.

### Clientes

- consulta de ordenes del cliente asignado,
- detalle de orden,
- aceptacion de orden,
- rechazo de orden,
- solicitud de revision,
- edicion de especificaciones para contraoferta,
- comentario del cliente,
- comparacion visual de cambios.

### Programacion

- listado de ordenes aceptadas,
- filtros por estado de asignacion, cliente y responsable,
- alta y edicion de asignaciones,
- seleccion de responsable,
- captura de fecha y comentario de programacion.

### Operaciones

- listado de ordenes asignadas,
- detalle operativo,
- registro de peso real,
- registro de embalaje real,
- registro de nota de operacion,
- guardado de ejecucion,
- validacion tecnica para pasar a despacho.

### Management

- listado de ordenes para validacion de despacho,
- comparacion entre especificacion y ejecucion,
- aprobacion para despacho,
- rechazo de validacion,
- creacion de informacion de envio cuando corresponde.

### Despacho

- listado de ordenes de envio,
- filtros por estado de despacho,
- generacion de orden de despacho,
- cambio de estado a `En ruta`,
- seguimiento de orden despachada,
- marcado de entrega.

### Usuarios

- listado de usuarios,
- busqueda por nombre, correo o rol,
- cambio de rol,
- activacion o desactivacion,
- eliminacion,
- alta de usuarios internos,
- alta de usuarios externos ligados a clientes.

### Leaderboard

- ranking de trabajadores,
- ranking de gestores,
- filtros por periodo,
- podio top 3,
- score calculado desde actividad real.

### Simulacion de Tarima

- visualizacion 3D,
- orientacion vertical u horizontal,
- comparacion entre tarima original y contraoferta,
- calculo de metricas de ancho, altura y peso,
- clasificacion de riesgo:
  - `SEGURO`,
  - `OBSERVACION`,
  - `RIESGOSO`,
  - `NO_PERMITIDO`.

## Roles contemplados

Roles con permisos definidos en la app:

- `admin`
- `user_admin`
- `client_manager`
- `order_manager`
- `operations_manager`
- `scheduler`
- `order_controller`

En la interfaz tambien aparece el rol `dispatcher`, pero actualmente no esta incluido en el mapa principal de permisos.

## Stack tecnologico

### Frontend

- Next.js 16
- React 19
- Tailwind CSS 4
- TypeScript

### Backend y datos

- Supabase Auth
- Supabase Database

### Visualizacion

- Three.js
- React Three Fiber
- React Three Drei
- Leaflet
- React Leaflet

### Utilidades

- Axios
- React Hot Toast
- React Icons

## Estructura general de rutas

### Publicas

- `/`
- `/login`

### Privadas

- `/ternium/dashboard`
- `/ternium/leaderboard`
- `/ternium/usuarios`
- `/ternium/usuarios/crearusuario`
- `/ternium/clientes`
- `/ternium/clientes/orden/[slug]`
- `/ternium/gestion`
- `/ternium/gestion/crearpedido`
- `/ternium/gestion/orden/[slug]`
- `/ternium/programacion`
- `/ternium/programacion/editar/[slug]`
- `/ternium/operaciones`
- `/ternium/operaciones/orden/[slug]`
- `/ternium/management`
- `/ternium/management/orden/[slug]`
- `/ternium/despacho`
- `/ternium/despacho/gestionar/[slug]`
- `/ternium/despacho/orden/[slug]`

## Entidades principales

La app interactua directamente con estas tablas o dominios principales:

- `users`
- `roles`
- `clients`
- `client_workers`
- `orders`
- `product`
- `specs`
- `order_offers`
- `order_offers_specs`
- `programing_instructions`
- `execution_details`
- `dispatch_validation`
- `shipping_info`

## Scripts disponibles

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run gen:types
```

## Variables de entorno esperadas

El proyecto usa al menos estas variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_PRODUCTION_API=
```

## Como levantar el proyecto

1. Instala dependencias:

```bash
npm install
```

2. Configura las variables de entorno necesarias.

3. Inicia el servidor de desarrollo:

```bash
npm run dev
```

4. Abre la app en:

```text
http://localhost:3000
```

## Estado actual y limitaciones conocidas

Estas funciones existen en interfaz pero hoy estan incompletas o son parciales:

- exportacion de usuarios:
  - visible,
  - deshabilitada,
  - marcada como "Proximamente".
- descarga e impresion en `Gestion`:
  - visibles,
  - deshabilitadas.
- boton `Descargar PDF` en detalle de gestion:
  - visible,
  - sin implementacion real.
- icono de descarga en `Programacion`:
  - visible,
  - sin logica conectada.
- algunos datos de transporte en `Despacho`:
  - empresa transportista,
  - guia de remision,
  - TAR,
  - placas,
  son visuales y no se persisten en base de datos.
- el mapa de despacho es estatico:
  - no hay rastreo GPS real,
  - no hay tracking en tiempo real.

## Documentacion adicional

Para una descripcion funcional completa, revisar:

- [DOCUMENTACION_FUNCIONAL_COMPLETA.md](./DOCUMENTACION_FUNCIONAL_COMPLETA.md)

## Resumen

Este proyecto ya cubre el flujo principal de negocio de punta a punta:

- captura de orden,
- revision de cliente,
- contraoferta,
- aprobacion,
- programacion,
- ejecucion,
- validacion para despacho,
- envio,
- entrega.

Su mayor diferenciador funcional es la combinacion entre gestion operativa por roles y simulacion 3D de tarima para apoyar decisiones tecnicas y logisticas.
