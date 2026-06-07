# Feature: Alumnos — Documentación Técnica

Gestión del perfil de alumno autenticado. Permite al alumno actualizar sus datos personales, médicos y de dirección.

---

## Estructura de Archivos

```text
src/features/alumnos/
├── alumno.routes.js       # Endpoints y middlewares
├── alumno.controller.js   # Manejo Request/Response (catchAsync)
├── alumno.service.js      # Lógica de servicio directriz
├── alumno.schema.js       # Schema Zod para validación de body
└── logic/
    └── alumno.logic.js    # Tareas modulares: direcciones y perfiles médicos
```

---

## Modelo de Datos

```mermaid
erDiagram
    usuarios ||--o| alumnos : "si rol=alumno"
    alumnos |o--o| direcciones : "vive en"
    alumnos ||--o{ alumnos_contactos : "emergencia"

    alumnos {
        int usuario_id PK_FK
        int direccion_id FK
        string condiciones_medicas
        string seguro_medico
        string grupo_sanguineo
    }

    direcciones {
        int id PK
        string direccion_completa
        string distrito
        string ciudad
        string referencia
    }
```

---

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `PATCH` | `/api/alumno/mi-perfil` | `Alumno` | Actualizar perfil del alumno autenticado |

---

## Flujo de Datos

```mermaid
sequenceDiagram
    participant C as Cliente
    participant R as Router
    participant M as Middlewares
    participant Ctrl as Controller
    participant S as Service
    participant L as Logic
    participant DB as Prisma/PostgreSQL

    C->>R: PATCH /api/alumno/mi-perfil
    R->>M: authenticate → authorize('Alumno') → validate(schema)
    M->>Ctrl: req.user.id + req.body validado
    Ctrl->>S: actualizarMiPerfil(id, datos)
    S->>L: Delegación en $transaction
    L->>DB: 1. actualizarDatosBaseUsuario (email, tel, fecha)
    L->>DB: 2. gestionarDireccion (Crear o Update)
    L->>DB: 3. actualizarPerfilMedico
    DB-->>L: alumno actualizado (select)
    L-->>S: perfil ensamblado
    S-->>Ctrl: resultado
    Ctrl-->>C: apiResponse.success(200)
```

---

## Schema Zod (`alumno.schema.js`)

| Schema | Uso | Qué valida |
|--------|-----|------------|
| `actualizarPerfilSchema` | `PATCH /mi-perfil` | Todos los campos opcionales: email, teléfono, fecha nacimiento, datos médicos, dirección. `.strict()` rechaza campos desconocidos. |

---

## Service (`alumno.service.js`)

### `actualizarMiPerfil` — Orquestación con `alumno.logic.js`

El controlador de `actualizarMiPerfil` fue aligerado cediendo su transacción a múltiples inyecciones de dependencias lógicas `tx` alojadas en `logic/alumno.logic.js`:
- `actualizarDatosBaseUsuario`: Actualiza la tabla raíz `usuarios` (email, teléfono, fecha de nacimiento)
- `gestionarDireccion`: Sub-rutina que verifica la pre-existencia y actualiza selectivamente o crea desde cero la sede `direcciones` con retorno de su ID final.
- `actualizarPerfilMedico`: Desplomadora del return que empalma el ID de dirección con el registro `alumnos` junto a condiciones y perfil selectivo.

---

## Cadena de Middlewares

| Ruta | Cadena |
|------|--------|
| `PATCH /mi-perfil` | `authenticate` → `authorize('Alumno')` → `validate(actualizarPerfilSchema)` → controller |
