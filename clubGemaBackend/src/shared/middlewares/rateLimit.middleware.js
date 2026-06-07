import rateLimit from 'express-rate-limit';
import { apiResponse } from '../utils/response.util.js';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Limita a 5 intentos por IP por ventana de 15 minutos
  standardHeaders: true, // Retorna info en headers `RateLimit-*`
  legacyHeaders: false, // Deshabilita los headers `X-RateLimit-*`
  handler: (req, res) => {
    return apiResponse.error(
      res,
      'Demasiados intentos de inicio de sesión, por favor intente nuevamente después de 15 minutos',
      429
    );
  },
  skipSuccessfulRequests: true, // Opcional: no contar logins exitosos
});
