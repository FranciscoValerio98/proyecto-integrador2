import { apiResponse } from '../utils/response.util.js';
import { logger } from '../utils/logger.util.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(err.message || err);
  // Error personalizado
  if (err.statusCode) {
    return apiResponse.error(res, {
      status: err.statusCode,
      message: err.message,
      details: err.details,
    });
  }

  // Errores de Prisma
  if (err.code) {
    if (err.code === 'P2002') {
      return apiResponse.error(res, {
        status: 400,
        message: 'El registro ya existe',
        details: err.meta,
      });
    }
    if (err.code === 'P2025') {
      return apiResponse.error(res, {
        status: 404,
        message: 'Registro no encontrado',
      });
    }
    if (err.code === 'P2003') {
      return apiResponse.error(res, {
        status: 400,
        message: 'Operación inválida: referencia a datos no existentes',
      });
    }
  }

  if (err.name === 'JsonWebTokenError') {
    return apiResponse.error(res, {
      status: 401,
      message: 'Token inválido',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return apiResponse.error(res, {
      status: 401,
      message: 'Token expirado',
    });
  }

  // Error genérico
  return apiResponse.error(res, {
    status: 500,
    message: err.message || 'Error interno del servidor',
  });
};
