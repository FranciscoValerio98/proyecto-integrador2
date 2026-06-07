import { prisma } from '../../config/database.config.js';
import { ApiError } from '../../shared/utils/error.util.js';

const NIVEL_SELECT = { id: true, nombre: true };

export const nivelService = {
  createNivel: async (data) => {
    const nivelExistente = await prisma.niveles_entrenamiento.findFirst({
      where: { nombre: { equals: data.nombre, mode: 'insensitive' } },
      select: { id: true },
    });

    if (nivelExistente) throw new ApiError('El nivel ya existe', 409);

    return await prisma.niveles_entrenamiento.create({
      data: { nombre: data.nombre },
      select: NIVEL_SELECT,
    });
  },

  getAllNiveles: async () => {
    return await prisma.niveles_entrenamiento.findMany({
      select: NIVEL_SELECT,
      orderBy: { nombre: 'asc' },
    });
  },

  updateNivel: async (id, data) => {
    const nivel = await prisma.niveles_entrenamiento.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!nivel) throw new ApiError('Nivel no encontrado', 404);

    return await prisma.niveles_entrenamiento.update({
      where: { id },
      data,
      select: NIVEL_SELECT,
    });
  },

  deleteNivel: async (id) => {
    const nivel = await prisma.niveles_entrenamiento.findUnique({
      where: { id },
      select: { id: true, _count: { select: { horarios_clases: true } } },
    });

    if (!nivel) throw new ApiError('Nivel no encontrado', 404);

    if (nivel._count.horarios_clases > 0) {
      throw new ApiError('No se puede eliminar el nivel porque tiene horarios asociados', 409);
    }

    return await prisma.niveles_entrenamiento.delete({
      where: { id },
      select: NIVEL_SELECT,
    });
  },
};
