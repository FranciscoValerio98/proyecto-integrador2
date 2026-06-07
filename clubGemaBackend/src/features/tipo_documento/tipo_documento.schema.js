import { z } from 'zod';

export const tipoDocumentoSchema = {
  createSchema: z.object({
    id: z
      .string({ required_error: 'El ID o acrónimo (ej: DNI) es requerido' })
      .trim()
      .toUpperCase()
      .min(2, 'El código debe tener al menos 2 letras')
      .max(10, 'El código es demasiado largo'),
    descripcion: z
      .string({ required_error: 'La descripción es obligatoria' })
      .trim()
      .min(3, 'La descripción debe tener al menos 3 caracteres')
      .max(100, 'La descripción no debe exceder 100 caracteres'),
  }),

  updateSchema: z
    .object({
      descripcion: z
        .string()
        .trim()
        .min(3, 'La descripción debe tener al menos 3 caracteres')
        .max(100, 'La descripción no debe exceder 100 caracteres')
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Debe enviar el campo descripcion para actualizar',
    }),

  idParamSchema: z.object({
    id: z
      .string()
      .trim()
      .toUpperCase()
      .min(2, 'El ID de documento debe tener al menos 2 letras')
      .max(10, 'El ID de documento es inválido'),
  }),
};
