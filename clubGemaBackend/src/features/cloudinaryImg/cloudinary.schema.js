import { z } from 'zod';

export const cloudinarySchema = {
  uploadSchema: z.object({
    folderName: z
      .string({ required_error: 'El nombre de carpeta es requerido' })
      .trim()
      .min(1, 'El nombre de carpeta no puede estar vacío')
      .max(100, 'Máximo 100 caracteres'),
  }),
};
