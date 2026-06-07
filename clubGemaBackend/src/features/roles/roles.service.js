import { prisma } from '../../config/database.config.js';
import { ApiError } from '../../shared/utils/error.util.js';

const ROLES_SELECT = { id: true, nombre: true, descripcion: true };

export const rolesService = {
  createRole: async (rolesData) => {
    const { nombre, descripcion } = rolesData;
    const nombreNormalizado = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();

    const existingRole = await prisma.roles.findUnique({
      where: { nombre: nombreNormalizado },
      select: { id: true },
    });
    if (existingRole) {
      throw new ApiError('El rol ya existe', 400);
    }

    return await prisma.roles.create({
      data: { nombre: nombreNormalizado, descripcion },
      select: ROLES_SELECT,
    });
  },

  getAllRoles: async () => {
    return await prisma.roles.findMany({ select: ROLES_SELECT });
  },

  getRoleById: async (id) => {
    const rol = await prisma.roles.findUnique({
      where: { id },
      select: ROLES_SELECT,
    });
    if (!rol) {
      throw new ApiError('El rol no existe', 404);
    }
    return rol;
  },

  getRoleByNombre: async (nombre) => {
    const rol = await prisma.roles.findUnique({
      where: { nombre },
      select: ROLES_SELECT,
    });
    if (!rol) {
      throw new ApiError('El rol no existe', 404);
    }
    return rol;
  },

  updateRole: async (id, data) => {
    return await prisma.roles.update({
      where: { id },
      data: { descripcion: data.descripcion },
      select: ROLES_SELECT,
    });
  },

  deleteRole: async (id) => {
    const rol = await prisma.roles.findUnique({
      where: { id },
      select: { id: true, _count: { select: { usuarios: true } } },
    });

    if (!rol) {
      throw new ApiError('El rol que intenta eliminar no existe', 404);
    }

    if (rol._count.usuarios > 0) {
      throw new ApiError(
        'No se puede eliminar el rol porque existen usuarios asignados a él actualmente.',
        400
      );
    }

    return await prisma.roles.delete({
      where: { id },
      select: ROLES_SELECT,
    });
  },
};
