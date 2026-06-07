# Asistencia - Documentación Técnica (Antigravity 🚀)

## 1. Estructura de Archivos
Este feature maneja el control de puntualidad, faltas, asistencias regulares y registro de clases de recuperación.
```text
src/features/asistencia/
├── asistencia.routes.js       # Rutas (GET, POST)
├── asistencia.controller.js   # Interacción HTTP y apiResponse
├── asistencia.service.js      # Lógica pesada, interacción con Prisma y recuperaciones
└── asistencia.schema.js       # Validaciones Zod (Parámetros, Queries y Body Masiva)
```

## 2. Modelo de Datos
```mermaid
erDiagram
  REGISTROS_ASISTENCIA {
    Int id PK
    Int inscripcion_id FK
    DateTime fecha
    String estado "PRESENTE, FALTA, JUSTIFICADO_LESION, PROGRAMADA"
    String comentario
  }
  INSCRIPCIONES ||--o{ REGISTROS_ASISTENCIA : tiene
  HORARIOS_CLASES ||--o{ INSCRIPCIONES : inscribe
  MODULOS_MESES ||--o{ INSCRIPCIONES : agrupa
  RECUPERACIONES |o--| REGISTROS_ASISTENCIA : "puede convertirse de falta"
```

## 3. Endpoints

Todas las rutas requieren token (`authenticate`).

| Método | Endpoint | Roles Permitidos | Zod Schema | Descripción |
|---|---|---|---|---|
| GET | `/` | Administrador, Coordinador | *Ninguno* | Lista historial general de todas las asistencias. |
| GET | `/alumno/:alumnoId` | Admin, Coordinador, Alumno | `alumnoIdParamSchema` | Lista las asistencias históricas de un alumno. |
| GET | `/agenda/hoy` | Coordinador | `agendaQuerySchema` | Lista las clases que tiene asignadas el coordinador en el día consultado. |
| GET | `/agenda` | Coordinador | `agendaQuerySchema` | Lista general de la agenda de clases para un coordinador (filtrable). |
| POST | `/masiva` | Coordinador | `masivaSchema` | Marca un lote de `asistencias` simultáneas. |

## 4. Cadena de Middlewares

Ejemplo del flujo de seguridad para `/masiva`:
1. `authenticate`: Verifica que el Token JWT sea válido y activo.
2. `authorize('Coordinador')`: Verifica el rol en DB del usuario.
3. `validate(asistenciaSchema.masivaSchema)`: Asegura que viene el arreglo de asistencias con estructura limpia (ID y Estado válido).
4. `asistenciaController.marcarAsistenciaMasiva`: Invoca el servicio.

## 5. Schemas Zod

| Schema | Propósito | Se usa en | Uso en Middleware |
|---|---|---|---|
| `alumnoIdParamSchema` | Valida que `req.params.alumnoId` sea un string parseable a número positivo. | `/alumno/:alumnoId` | `validateParams` |
| `agendaQuerySchema` | Asegura formato *datetime* (opcional) del query param para la agenda. | `/agenda`, `/agenda/hoy` | `validateQuery` |
| `masivaSchema` | Fuerza un array mínimo de 1 asistencia. Soporta IDs enteros y IDs sintéticos (ej. `reg-asis-recu-123`). | `/masiva` | `validate` |

## 6. Lógica Core del Service

El archivo `asistencia.service.js` delega procesamiento intenso y delegaciones a transacciones ACID:
* **`generarClasesFuturas:`** Algoritmo que genera los registros (`PROGRAMADA`) masivamente hacia un límite de 30 días, empalmando ciclos o aceptando una fecha manual. Se usa un `createMany` con `skipDuplicates: true` de forma optimizada.
* **`procesarAsistenciaMasiva:`** Contiene un ciclo robusto empaquetado en una gran transacción `$transaction`:
  * Detecta si la asistencia viene de un registro de *Recuperación* (IDs como `reg-asis-recu-X`) e intercepta marcándolo en `recuperaciones`.
  * Filtra las justificaciones de lesión (`JUSTIFICADO_LESION`).
  * Al marcar una `FALTA`, contacta dinámicamente al **`recuperacionService`** para generar un ticket pendiente de recuperación.
  * Al revertir una falta a `PRESENTE`, interactúa nuevamente con el **`recuperacionService`** para **anular** el ticket de recuperación que ya se haya creado.
* **`obtenerAgendaCoordinador:`** Obtiene el formato especial (`horariosProcesados`) en el que inyecta programáticamente a los alumnos que asisten por recuperación ese día (camuflándolos para que aparezcan en la app del coordinador con estado de recuperar). Mínima latencia gracias a los bloqueos de mutación optimistas.
