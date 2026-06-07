import { z } from 'zod';

// ============================================
// MIDDLEWARE DE VALIDACIÓN EXISTENTE (Body)
// ============================================
export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      // 1. Mapeamos todos los errores
      const formattedErrors = error.errors.map((err) => ({
        campo: err.path.join('.'),
        mensaje: err.message
      }));

      // 2. Tomamos el mensaje del PRIMER error para que el 'message' sea útil
      const mensajePrincipal = formattedErrors[0].mensaje;

      return res.status(400).json({
        status: 'error',
        message: mensajePrincipal, 
        errors: formattedErrors
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor durante la validación'
    });
  }
};

// ============================================
// MIDDLEWARE PARA VALIDAR PARAMS
// ============================================
export const validateParams = (schema) => (req, res, next) => {
  try {
    req.params = schema.parse(req.params);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Parámetros de ruta inválidos',
        errors: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          received: err.received,
        })),
        code: 'INVALID_PARAMS',
      });
    }
    next(error);
  }
};

// ============================================
// MIDDLEWARE PARA VALIDAR QUERY
// ============================================
export const validateQuery = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.query);
    // Avoid direct assignment of req.query which can fail
    for (const key in req.query) delete req.query[key];
    Object.assign(req.query, parsed);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Parámetros de consulta inválidos',
        errors: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          received: err.received,
        })),
        code: 'INVALID_QUERY',
      });
    }
    next(error);
  }
};
