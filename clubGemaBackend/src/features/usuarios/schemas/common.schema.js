import z from 'zod';
import { VALID_ROLES_ARRAY } from '../../roles/roles.constants.js';

export const commonUsuarioSchemas = {
  idParamSchema: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número')
      .transform((val) => Number.parseInt(val, 10))
      .refine((val) => val > 0, 'El ID debe ser mayor a 0'),
  }),

  rolParamSchema: z.object({
    rol: z
      .string({ required_error: 'El rol es requerido' })
      .trim()
      .min(1, 'El rol es requerido')
      .max(50),
  }),

  validateRoleSchema: z.object({
    rol_id: z.union([z.enum(VALID_ROLES_ARRAY), z.number().int().positive()]),
    datosRolEspecifico: z.record(z.any()).optional().default({}),
  }),
};
