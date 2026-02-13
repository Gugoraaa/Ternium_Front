# 📘 REGLAS DE CÓDIGO – CONVENCIONES DE NOMBRES

## 1️⃣ Convenciones Permitidas

En este proyecto **solo se utilizarán**:

- ✅ **camelCase**
- ✅ **PascalCase**

No se permite:

- ❌ UPPERCASE para funciones o variables
- ❌ snake_case
- ❌ kebab-case
- ❌ Mezclar idiomas
- ❌ Abreviaciones poco claras

---

## 2️⃣ Uso de PascalCase

Se utiliza **PascalCase** (PrimeraLetraMayúscula) para:

- Clases (Java)
- Componentes React
- Interfaces
- Types
- Enums
- DTOs

### ✔ Ejemplos correctos

```
UserService
LoginForm
UserResponse
AuthController
OrderDto
```

---

## 3️⃣ Uso de camelCase

Se utiliza **camelCase** (primeraLetraMinúscula) para:

- Variables
- Funciones
- Métodos
- Props
- Parámetros
- Instancias

### ✔ Ejemplos correctos

```
userName
getUserById
createOrder
updateProfile
totalAmount
```

---

## 4️⃣ Reglas para Funciones

- Siempre deben comenzar con un **verbo**.
- Deben describir claramente lo que hacen.
- Deben ser claras y específicas.

### ✔ Correcto

```
getUser
createOrder
updateProfile
deleteAccount
calculateTotal
```

### ❌ Incorrecto

```
user
orderData
process
data
info
```

---

## 5️⃣ Reglas para Booleanos

Los booleanos deben comenzar con:

- `is`
- `has`
- `can`
- `should`

### ✔ Correcto

```
isActive
hasAccess
canEdit
shouldRetry
```

### ❌ Incorrecto

```
active
permission
edit
flag
```

---

## 6️⃣ Consistencia Obligatoria

- No mezclar español e inglés.
- No usar abreviaciones como `usr`, `cfg`, `respObj`.
- Los nombres deben ser claros y descriptivos.
- Estas reglas aplican a **backend (Java)** y **frontend (Next.js)**.
- Todo Pull Request debe respetar estas convenciones.

---

## 7️⃣ Idioma Obligatorio

- **Todo el código debe programarse en inglés**
- Nombres de variables, funciones, clases, componentes, etc.
- Comentarios y documentación
- Mensajes de error y logs
- Nombres de archivos y carpetas

### ✔ Correcto

```
const userName = 'john_doe';
function getUserById(id) {
  return userRepository.findById(id);
}
class UserService {
  constructor() {
    this.isActive = true;
  }
}
```

### ❌ Incorrecto

```
const nombreUsuario = 'juan_perez';
function obtenerUsuarioPorId(id) {
  return repositorioUsuarios.findById(id);
}
class ServicioUsuario {
  constructor() {
    this.estaActivo = true;
  }
}
```

---

📌 **Estas reglas son obligatorias para todo el equipo y deben cumplirse en cada commit.**
