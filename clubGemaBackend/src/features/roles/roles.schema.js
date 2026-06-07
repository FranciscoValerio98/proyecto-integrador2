import z from 'zod';

export const rolesSchema = {
  crearRolSchema: z.object({
    nombre: z
      .string({ required_error: 'El nombre del rol es requerido' })
      .trim()
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(50, 'El nombre no puede exceder 50 caracteres'),
    descripcion: z
      .string()
      .trim()
      .max(200, 'La descripción no puede exceder 200 caracteres')
      .nullable()
      .optional(),
  }),

  actualizarRolSchema: z
    .object({
      descripcion: z
        .string()
        .trim()
        .max(200, 'La descripción no puede exceder 200 caracteres')
        .nullable()
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Debe proporcionar al menos un campo para actualizar',
    }),

  idParamSchema: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0, 'El ID debe ser mayor a 0'),
  }),

  nombreParamSchema: z.object({
    nombre: z
      .string({ required_error: 'El nombre es requerido' })
      .trim()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(50, 'El nombre no puede exceder 50 caracteres'),
  }),
};
