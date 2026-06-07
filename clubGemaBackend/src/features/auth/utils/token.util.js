import crypto from 'node:crypto';

export const tokenUtils = {
  /**
   * Genera de forma segura un nuevo token opaco de refresco en formato hexadecimal.
   * Utiliza la librería nativa `crypto` para una ejecución síncrona hiperveloz (Antigravity).
   * @returns {string} Token criptográficamente seguro de 64 caracteres.
   */
  generateRefreshToken: () => {
    return crypto.randomBytes(32).toString('hex');
  },

  /**
   * Calcula la fecha de expiración sumando una cantidad de días.
   * @param {number|string} days - Número de días de validez del token (por defecto 7).
   * @returns {Date} Fecha de expiración calculada.
   */
  getRefreshTokenExpiration: (days) => {
    const daysNum = Number.parseInt(days, 10) || 7;
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysNum);
    return expirationDate;
  },

  /**
   * Comprueba si un token ha expirado. Actúa en fail-fast retornando true si la fecha es inválida.
   * @param {Date|string|number} expiresAt - Fecha de expiración a verificar.
   * @returns {boolean} `true` si el token expiró o la fecha es maliciosa.
   */
  isTokenExpired: (expiresAt) => {
    const expiry = new Date(expiresAt);
    if (Number.isNaN(expiry.getTime())) {
      return true;
    }

    return new Date() > expiry;
  },
 
  /**
   * Genera un hash SHA-256 de un token para su almacenamiento seguro.
   * @param {string} token - Token en texto plano.
   * @returns {string} Hash hexadecimal del token.
   */
  hashToken: (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
  },
};
