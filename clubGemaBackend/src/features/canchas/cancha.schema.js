import { z } from 'zod';

export const canchaSchema = {
  createSchema: z.object({
    nombre: z
      .string({ required_error: 'El nombre es requerido' })
      .trim()
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres'),
    descripcion: z.string().trim().max(200, 'La descripción es muy larga').nullable().optional(),
    sede_id: z.coerce
      .number({ required_error: 'Sede ID es requerido' })
      .int()
      .positive('Sede ID debe ser positivo'),
  }),

  updateSchema: z
    .object({
      nombre: z.string().trim().min(3).max(100).optional(),
      descripcion: z.string().trim().max(200).nullable().optional(),
      sede_id: z.coerce.number().int().positive().optional(),
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
};
