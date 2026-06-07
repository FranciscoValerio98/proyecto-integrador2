import { z } from 'zod';

const GRUPOS_SANGUINEOS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export const actualizarPerfilSchema = z
  .object({
    email: z.string().email('Email inválido').optional(),

    telefono_personal: z
      .string()
      .regex(/^\+?[0-9]{7,15}$/, 'Formato de teléfono inválido')
      .optional(),

    fecha_nacimiento: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
      .transform((val) => new Date(val))
      .optional(),
    genero: z
      .enum(['M', 'F'], {
        errorMap: () => ({ message: 'El género debe ser M o F' }),
      })
      .optional(),

    condiciones_medicas: z.string().max(500, 'Máximo 500 caracteres').optional(),

    seguro_medico: z.string().max(100, 'Máximo 100 caracteres').optional(),

    grupo_sanguineo: z
      .enum(GRUPOS_SANGUINEOS, {
        errorMap: () => ({
          message: `Grupo sanguíneo inválido. Permitidos: ${GRUPOS_SANGUINEOS.join(', ')}`,
        }),
      })
      .optional(),

    direccion_completa: z
      .string()
      .min(3, 'La dirección debe tener al menos 3 caracteres')
      .max(255, 'Máximo 255 caracteres')
      .optional(),

    distrito: z
      .string()
      .min(1, 'El distrito no puede estar vacío')
      .max(100, 'Máximo 100 caracteres')
      .optional(),

    ciudad: z.string().max(100, 'Máximo 100 caracteres').optional(),

    referencia: z.string().max(500, 'Máximo 500 caracteres').optional(),

    tipo_documento_id: z.string().max(10, 'Máximo 10 caracteres').optional(),

    numero_documento: z.string().max(20, 'Máximo 20 caracteres').optional(),
  })
  .strict();
