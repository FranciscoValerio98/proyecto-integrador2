import { z } from 'zod';

export const catalogoSchema = {
  createSchema: z.object({
    codigo_interno: z
      .string({ required_error: 'El código interno es requerido' })
      .trim()
      .min(2, 'El código debe tener al menos 2 caracteres')
      .max(50, 'El código es demasiado largo'),
    nombre: z
      .string({ required_error: 'El nombre es obligatorio' })
      .trim()
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(100, 'El nombre no debe exceder 100 caracteres'),
    precio_base: z.coerce
      .number({ required_error: 'El precio base es requerido' })
      .nonnegative('El precio no puede ser negativo'),
    cantidad_clases_semanal: z.coerce
      .number()
      .int()
      .nonnegative('La cantidad de clases no puede ser negativa')
      .optional()
      .nullable(),
  }),

  updateSchema: z
    .object({
      codigo_interno: z.string().trim().min(2).max(50).optional(),
      nombre: z.string().trim().min(3).max(100).optional(),
      precio_base: z.coerce.number().nonnegative().optional(),
      cantidad_clases_semanal: z.coerce.number().int().nonnegative().optional().nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Debe proporcionar al menos un campo para actualizar',
    }),

  idParamSchema: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número')
      .transform(Number)
      .refine((val) => val > 0, 'El ID debe ser mayor a 0'),
  }),
};
