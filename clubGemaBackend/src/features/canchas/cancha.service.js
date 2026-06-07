import { prisma } from '../../config/database.config.js';
import { ApiError } from '../../shared/utils/error.util.js';

const CANCHA_SELECT = {
  id: true,
  nombre: true,
  descripcion: true,
  sede_id: true,
  sedes: { select: { id: true, nombre: true } },
};

export const canchaService = {
  create: async (data) => {
    const sede = await prisma.sedes.findUnique({
      where: { id: data.sede_id },
      select: { id: true },
    });
    if (!sede) throw new ApiError('Sede no encontrada', 404);

    return await prisma.canchas.create({
      data: { nombre: data.nombre, descripcion: data.descripcion || null, sede_id: data.sede_id },
      select: CANCHA_SELECT,
    });
  },

  getAll: async () => {
    return await prisma.canchas.findMany({
      select: CANCHA_SELECT,
      orderBy: { nombre: 'asc' },
    });
  },

  getById: async (id) => {
    const cancha = await prisma.canchas.findUnique({
      where: { id },
      select: CANCHA_SELECT,
    });
    if (!cancha) throw new ApiError('Cancha no encontrada', 404);
    return cancha;
  },

  update: async (id, data) => {
    const cancha = await prisma.canchas.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!cancha) throw new ApiError('Cancha no encontrada', 404);

    if (data.sede_id) {
      const sede = await prisma.sedes.findUnique({
        where: { id: data.sede_id },
        select: { id: true },
      });
      if (!sede) throw new ApiError('Sede no encontrada', 404);
    }

    return await prisma.canchas.update({
      where: { id },
      data,
      select: CANCHA_SELECT,
    });
  },

  delete: async (id) => {
    const cancha = await prisma.canchas.findUnique({
      where: { id },
      select: { id: true, _count: { select: { horarios_clases: true } } },
    });

    if (!cancha) throw new ApiError('Cancha no encontrada', 404);

    if (cancha._count.horarios_clases > 0) {
      throw new ApiError('No se puede eliminar la cancha porque tiene horarios asociados', 409);
    }

    return await prisma.canchas.delete({
      where: { id },
      select: { id: true, nombre: true },
    });
  },
};
