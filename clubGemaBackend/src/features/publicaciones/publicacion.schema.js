import { z } from 'zod';

export const publicacionSchema = {
  createSchema: z.object({
    titulo: z
      .string({ required_error: 'El título es requerido' })
      .trim()
      .min(3, 'El título debe tener al menos 3 caracteres')
      .max(150, 'El título no puede exceder 150 caracteres'),
    contenido: z
      .string({ required_error: 'El contenido es requerido' })
      .trim()
      .min(1, 'El contenido no puede estar vacío'),
  }),

  updateSchema: z
    .object({
      titulo: z.string().trim().min(3).max(150).optional(),
      contenido: z.string().trim().min(1).optional(),
      activo: z.preprocess(
        (val) => (val === 'true' ? true : val === 'false' ? false : val),
        z.boolean().optional()
      ),
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

  querySchema: z.object({
    activo: z.enum(['true', 'false']).optional(),
    titulo: z.string().trim().max(150).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
  }),
};
