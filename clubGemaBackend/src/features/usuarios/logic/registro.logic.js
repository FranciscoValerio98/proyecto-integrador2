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
   * Genera el contacto de emergencia obligatorio del alumno basándose en sus datos primarios.
   */
  async crearContactoEmergencia(tx, usuarioId, nombres, contacto_emergencia, parentesco) {
    if (!contacto_emergencia) return;

    const nombreEmergencia = `Emergencia ${nombres}`;

    const contactoExistente = await tx.alumnos_contactos.findFirst({
      where: {
        alumno_id: usuarioId,
        telefono: contacto_emergencia,
      },
    });

    if (!contactoExistente) {
      await tx.alumnos_contactos.create({
        data: {
          alumno_id: usuarioId,
          nombre_completo: nombreEmergencia,
          telefono: contacto_emergencia,
          relacion: parentesco,
          es_principal: true,
        },
      });
    }
  },

  /**
   * Construye el nombre de usuario de fallback auto-generado: "nombre.apellido123"
   */
  generarFallbackUsername: (nombres, apellidos, id) => {
    const primerNombre = nombres.split(' ')[0].toLowerCase();
    const primerApellido = apellidos.split(' ')[0].toLowerCase();
    return `${primerNombre}.${primerApellido}${id}`;
  },

  /**
   * Fábrica dependiente de Dominio para anexar los regímenes opcionales durante la transacción central
   */
  async createRoleSpecificData(tx, rolNombre, usuarioId, datos) {
    const roleHandlers = {
      [VALID_ROLES.ALUMNO]: async () => {
        let direccionId = null;

        if (datos.direccion?.direccion_completa) {
          const nuevaDireccion = await tx.direcciones.create({
            data: {
              direccion_completa: datos.direccion.direccion_completa,
              distrito: datos.direccion.distrito,
              ciudad: datos.direccion.ciudad || 'Lima',
              referencia: datos.direccion.referencia || null,
            },
          });
          direccionId = nuevaDireccion.id;
        }

        await tx.alumnos.create({
          data: {
            usuario_id: usuarioId,
            direccion_id: direccionId,
            condiciones_medicas: datos.condiciones_medicas || null,
            seguro_medico: datos.seguro_medico || null,
            grupo_sanguineo: datos.grupo_sanguineo || null,
          },
        });
      },
      [VALID_ROLES.COORDINADOR]: async () => {
        await tx.coordinadores.create({
          data: {
            usuario_id: usuarioId,
            especializacion: datos.especializacion || null,
          },
        });
      },
      [VALID_ROLES.ADMINISTRADOR]: async () => {
        if (!datos.cargo) {
          throw new ApiError('El campo "cargo" es obligatorio para administradores', 400);
        }
        await tx.administrador.create({
          data: {
            usuario_id: usuarioId,
            cargo: datos.cargo,
            sede_id: datos.sede_id || null,
            area: datos.area || null,
          },
        });
      },
    };

    const handler = roleHandlers[rolNombre];
    if (handler) {
      await handler();
    }
  },
};
