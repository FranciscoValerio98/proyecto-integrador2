import { z } from 'zod';

export const asistenciaSchema = {
  alumnoIdParamSchema: z.object({
    alumnoId: z
      .string()
      .regex(/^\d+$/, 'El ID del alumno debe ser un número')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0, 'El ID del alumno debe ser mayor a 0'),
  }),

  agendaQuerySchema: z.object({
    fecha: z
      .string()
      .datetime()
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
      .optional(),
  }),

  masivaSchema: z.object({
    asistencias: z
      .array(
        z.object({
          id: z.union([z.number(), z.string().regex(/^reg-asis-recu-\d+$/)]),
          estado: z.enum(['PRESENTE', 'FALTA', 'PROGRAMADA', 'JUSTIFICADO_LESION', 'SIN_REGISTRO',]),
          comentario: z.string().max(255).optional().nullable(),
        })
      )
      .min(1, 'El listado de asistencias no puede estar vacío'),
  }),
};
