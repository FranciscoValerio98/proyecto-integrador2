import bcrypt from 'bcryptjs';
import { ApiError } from '../../../shared/utils/error.util.js';
import { VALID_ROLES } from '../../roles/roles.constants.js';

export const registroLogic = {
  /**
   * Genera las credenciales por defecto durante la creación de un usuario.
   */
  async crearCredenciales(tx, usuarioId, finalUsername, rawPasswordProvided) {
    const passwordToHash = rawPasswordProvided || finalUsername;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(passwordToHash, saltRounds);

    await tx.credenciales_usuario.create({
      data: {
        usuario_id: usuarioId,
        hash_contrasena: hashedPassword,
      },
    });

    return passwordToHash; // Para mandar por correo el default auto-generado luego
  },

  /**
   * Construye el nombre de usuario de fallback auto-generado: "nombre.apellido123"
   */
  generarFallbackUsername: (nombres, apellidos, id) => {
    const primerNombre = nombres.split(' ')[0].toLowerCase();
    const primerApellido = apellidos.split(' ')[0].toLowerCase();
    return `${primerNombre}.${primerApellido}${id}`;
  },
};
