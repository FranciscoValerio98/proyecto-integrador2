import { z } from 'zod';

export const descuentosAplicadosSchema = {
  aplicarSchema: z.object({
    cuenta_id: z.coerce
      .number({ required_error: 'El ID de la cuenta es requerido' })
      .positive('El ID de cuenta debe ser positivo'),
    tipo_beneficio_id: z.coerce
      .number({ required_error: 'El ID del beneficio es requerido' })
      .positive('El ID de beneficio debe ser positivo'),
    motivo: z.string().trim().max(255).optional(),
  }),

  cuentaIdParamSchema: z.object({
    cuentaId: z.coerce.number().positive('El ID de la cuenta debe ser un número positivo'),
  }),

  descuentoIdParamSchema: z.object({
    id: z.coerce.number().positive('El ID del descuento debe ser un número positivo'),
  }),

  // Schema for DELETE query params
  eliminarQuerySchema: z.object({
    restaurar_beneficio: z
      .enum(['true', 'false'])
      .optional()
      .transform((val) => val === 'true'),
  }),
};
