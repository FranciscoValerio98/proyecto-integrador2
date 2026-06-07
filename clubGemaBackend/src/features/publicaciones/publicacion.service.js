import { prisma } from '../../config/database.config.js';
import { ApiError } from '../../shared/utils/error.util.js';
import { cloudinaryService } from '../cloudinaryImg/cloudinary.service.js';

const PUBLICACION_SELECT = {
  id: true,
  titulo: true,
  contenido: true,
  imagen_url: true,
  activo: true,
  creado_en: true,
  actualizado_en: true,
  administrador: {
    select: {
      usuarios: {
        select: { nombres: true, apellidos: true },
      },
    },
  },
};

/**
 * Sube imagen a Cloudinary si existe fileObject.
 */
const subirImagen = async (fileObject) => {
  if (!fileObject) return null;
  const resultado = await cloudinaryService.upload(fileObject, 'publicaciones');
  return resultado.url;
};

export const publicacionService = {
  createPublicacion: async (data, imagenFile) => {
    const admin = await prisma.administrador.findUnique({
      where: { usuario_id: data.autor_id },
      select: { usuario_id: true },
    });

    if (!admin) {
      throw new ApiError('Administrador (autor) no válido o no encontrado', 404);
    }

    const imageUrl = await subirImagen(imagenFile);

    return await prisma.publicaciones.create({
      data: {
        titulo: data.titulo,
        contenido: data.contenido,
        imagen_url: imageUrl,
        autor_id: admin.usuario_id,
        activo: true,
      },
      select: PUBLICACION_SELECT,
    });
  },

  getAllPublicaciones: async (filters = {}) => {
    const { activo, titulo, page = 1, limit = 10 } = filters;

    const where = {};
    if (activo !== undefined) where.activo = activo === 'true';
    if (titulo) where.titulo = { contains: titulo, mode: 'insensitive' };

    const skip = (page - 1) * limit;

    const [publicaciones, total] = await Promise.all([
      prisma.publicaciones.findMany({
        where,
        select: PUBLICACION_SELECT,
        orderBy: { creado_en: 'desc' },
        skip,
        take: limit,
      }),
      prisma.publicaciones.count({ where }),
    ]);

    return {
      publicaciones,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  getPublicacionById: async (id) => {
    const publicacion = await prisma.publicaciones.findUnique({
      where: { id },
      select: PUBLICACION_SELECT,
    });

    if (!publicacion) throw new ApiError('Publicación no encontrada', 404);
    return publicacion;
  },

  updatePublicacion: async (id, data, imagenFile) => {
    const existe = await prisma.publicaciones.findUnique({
      where: { id },
      select: { id: true, imagen_url: true },
    });

    if (!existe) throw new ApiError('Publicación no encontrada', 404);

    const nuevaImageUrl = (await subirImagen(imagenFile)) || existe.imagen_url;

    return await prisma.publicaciones.update({
      where: { id },
      data: {
        ...(data.titulo && { titulo: data.titulo }),
        ...(data.contenido && { contenido: data.contenido }),
        imagen_url: nuevaImageUrl,
        ...(data.activo !== undefined && { activo: data.activo }),
      },
      select: PUBLICACION_SELECT,
    });
  },

  toggleActivo: async (id, activo) => {
    const existe = await prisma.publicaciones.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existe) throw new ApiError('Publicación no encontrada', 404);

    return await prisma.publicaciones.update({
      where: { id },
      data: { activo },
      select: { id: true, activo: true },
    });
  },

  deletePublicacion: async (id) => {
    const existe = await prisma.publicaciones.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existe) throw new ApiError('Publicación no encontrada', 404);

    await prisma.publicaciones.delete({ where: { id } });
  },
};
