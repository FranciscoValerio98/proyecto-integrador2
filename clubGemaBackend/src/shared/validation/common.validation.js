import { z } from 'zod';

export const userCommonValidation = {
  emailSchema: z
    .string({ required_error: 'El email es requerido' })
    .email('Email inválido')
    .min(1, 'El email no puede estar vacío'),

  passwordSchema: z
    .string({ required_error: 'La contraseña es requerida' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es demasiado larga'),

  strongPasswordSchema: z
    .string({ required_error: 'La contraseña es requerida' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),

  nameSchema: z
    .string({ required_error: 'Este campo es requerido' })
    .min(2, 'Debe tener al menos 2 caracteres')
    .max(100, 'Debe tener máximo 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras y espacios'),

  phoneSchema: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, 'Formato de teléfono inválido')
    .optional(),

  dateSchema: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
    .transform((val) => new Date(val))
    .optional(),

  idSchema: z.number().int().positive(),

  stringIdSchema: z.string().min(1),
};
