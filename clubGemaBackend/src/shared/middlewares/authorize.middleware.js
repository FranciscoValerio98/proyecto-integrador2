import { apiResponse } from '../utils/response.util.js';

export const authorize = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return apiResponse.error(res, 'Usuario no autenticado', 401);
    }

    if (!rolesPermitidos.includes(req.user.rol_nombre)) {
      return apiResponse.error(
        res,
        `No tienes permisos para acceder a este recurso. Requiere: ${rolesPermitidos.join(', ')}`,
        403
      );
    }

    next();
  };
};
