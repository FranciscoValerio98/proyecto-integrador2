import jwt from 'jsonwebtoken';
import { tokenUtils } from '../utils/token.util.js';
import { ApiError } from '../../../shared/utils/error.util.js';
import {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRATION_DAYS,
} from '../../../config/secret.config.js';

export const authLogic = {
  /**
   * Valida si un usuario es apto para iniciar sesión o refrescar tokens.
   * Lanza un ApiError con el mensaje correspondiente si el usuario no es válido.
   * @param {Object} usuario - Datos del usuario desde BD.
   * @throws {ApiError} 403 Si está inactivo, sin credenciales o bloqueado.
   */
  validarEstadoUsuario: (usuario) => {
    if (!usuario.activo) {
      throw new ApiError('Usuario inactivo', 403);
    }

    if (!usuario.credenciales_usuario) {
      throw new ApiError('Usuario sin credenciales configuradas', 403);
    }

    if (usuario.credenciales_usuario.bloqueado) {
      throw new ApiError('Usuario bloqueado. Contacte al administrador', 403);
    }
  },

  /**
   * Genera el JWT de acceso y el token opaco de refresco para una sesión válida.
   * @param {Object} usuario - Datos del usuario autenficado.
   * @returns {{accessToken: string, refreshToken: string, expiresAt: Date}} Par de tokens generados.
   */
  generarSesionTokens: (usuario) => {
    // Si la estructura cambió de findUnique (dependiendo de si trae roles o rol_nombre)
    // asumiremos y ajustaremos `rol_nombre` aquí con un coalesce lógico.
    const rolNombre = usuario.roles?.nombre || usuario.rol_nombre;

    const accessToken = jwt.sign(
      {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email, // Agregado por seguridad extra también en JWT
        rol_id: usuario.rol_id,
        rol_nombre: rolNombre,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = tokenUtils.generateRefreshToken();
    const expiresAt = tokenUtils.getRefreshTokenExpiration(REFRESH_TOKEN_EXPIRATION_DAYS);

    return {
      accessToken,
      refreshToken,
      expiresAt,
    };
  },

  /**
   * Construye el DTO público del perfil del usuario para incluirlo en la respuesta del login.
   * Diferencia si el usuario debe completar el email según su existencia.
   * @param {Object} usuario - Datos del usuario desde BD.
   * @param {boolean} esLoginNuevo - Si true, agrega "debeCompletarEmail"
   * @returns {Object} DTO limpio del usuario.
   */
  construirInformacionPerfilUsuario: (usuario, esLoginNuevo = false) => {
    const baseData = {
      id: usuario.id,
      username: usuario.username,
      email: usuario.email,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      rol: usuario.roles?.nombre,
    };

    if (esLoginNuevo) {
      baseData.alumnos = usuario.alumnos;
      baseData.debeCompletarEmail = !usuario.email;
    }

    return baseData;
  },
};
