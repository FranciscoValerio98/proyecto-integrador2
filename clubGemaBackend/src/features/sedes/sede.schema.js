import z from 'zod';

const direccionSchema = z.object({
  direccion_completa: z
    .string({ required_error: 'La dirección es requerida' })
    .trim()
    .min(3, 'La dirección debe tener al menos 3 caracteres')
    .max(255),
  distrito: z
    .string({ required_error: 'El distrito es requerido' })
    .trim()
    .min(1, 'El distrito es requerido')
    .max(100),
  ciudad: z.string().trim().min(1, 'La ciudad es requerida').max(100).default('Lima').optional(),
  referencia: z.string().trim().max(255).nullable().optional(),
});

const canchaCreateSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre de la cancha es requerido'),
  descripcion: z.string().trim().max(200).nullable().optional(),
});

const canchaUpdateSchema = canchaCreateSchema.extend({
  id: z.coerce
    .number({ invalid_type_error: 'El id de la cancha debe ser numerico' })
    .int('El id de la cancha debe ser un entero')
    .positive('El id de la cancha debe ser mayor a 0')
    .optional(),
});

export const sedeSchema = {
  createSedeSchema: z.object({
    nombre: z
      .string({ required_error: 'El nombre es requerido' })
      .trim()
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres'),

    telefono_contacto: z
      .string({ required_error: 'El teléfono es requerido' })
      .regex(/^[0-9+ ]+$/, 'El teléfono solo puede contener números, espacios y +')
      .nullable()
      .optional(),

    tipo_instalacion: z
      .string()
      .trim()
      .max(50, 'El tipo de instalación no puede exceder 50 caracteres')
      .nullable()
      .optional(),

    activo: z.boolean().optional().default(true),

    administrador_id: z.coerce.number({
      required_error: 'El ID del administrador es requerido',
    }).positive('El ID del administrador debe ser un número positivo'),

    direccion: direccionSchema,

    canchas: z.array(canchaCreateSchema).optional().default([]),
  }),

  // ACTUALIZADO: Optimizado para el Service
  updateSedeSchema: z
    .object({
      nombre: z.string().trim().min(3).max(100).optional(),
      telefono_contacto: z
        .string()
        .regex(/^[0-9+ ]+$/, 'Formato de teléfono inválido')
        .nullable()
        .optional(),
      tipo_instalacion: z.string().trim().max(50).nullable().optional(),
      activo: z.boolean().optional(),
      administrador_id: z.number().positive().optional(),
      // Usamos .deepPartial() o simplemente dejamos que los campos internos sean opcionales
      direccion: direccionSchema.partial().optional(),
      canchas: z.array(canchaUpdateSchema).optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      { message: 'Debe proporcionar al menos un campo para actualizar' }
    ),

  sedeIdParamSchema: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0, 'El ID debe ser mayor a 0'),
  }),

  sedeQuerySchema: z.object({
    activo: z
      .preprocess((val) => {
        if (val === 'true') return true;
        if (val === 'false') return false;
        return val;
      }, z.boolean().optional()),
    distrito: z.string().trim().optional(),
    tipo_instalacion: z.string().trim().optional(),
    page: z
      .string()
      .regex(/^\d+$/)
      .transform((val) => parseInt(val, 10))
      .default('1'),
    limit: z
      .string()
      .regex(/^\d+$/)
      .transform((val) => parseInt(val, 10))
      .default('10'),
  }),
};
