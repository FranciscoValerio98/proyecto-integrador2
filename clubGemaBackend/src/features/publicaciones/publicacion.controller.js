import { publicacionService } from './publicacion.service.js';
import { apiResponse } from '../../shared/utils/response.util.js';
import { catchAsync } from '../../shared/utils/catchAsync.util.js';

export const publicacionController = {
  createPublicacion: catchAsync(async (req, res) => {
    const publicacion = await publicacionService.createPublicacion(
      { ...req.body, autor_id: req.user.id },
      req.file
    );
    return apiResponse.created(res, {
      message: 'Publicación creada exitosamente',
      data: publicacion,
    });
  }),

  getAllPublicaciones: catchAsync(async (req, res) => {
    const result = await publicacionService.getAllPublicaciones(req.query);
    return apiResponse.success(res, {
      message: 'Publicaciones obtenidas exitosamente',
      data: result.publicaciones,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  }),

  getPublicacionById: catchAsync(async (req, res) => {
    const publicacion = await publicacionService.getPublicacionById(req.params.id);
    return apiResponse.success(res, {
      message: 'Publicación obtenida exitosamente',
      data: publicacion,
    });
  }),

  updatePublicacion: catchAsync(async (req, res) => {
    const publicacion = await publicacionService.updatePublicacion(
      req.params.id,
      req.body,
      req.file
    );
    return apiResponse.success(res, {
      message: 'Publicación actualizada exitosamente',
      data: publicacion,
    });
  }),

  updateDefusePublicacion: catchAsync(async (req, res) => {
    await publicacionService.toggleActivo(req.params.id, false);
    return apiResponse.noContent(res);
  }),

  updateActivePublicacion: catchAsync(async (req, res) => {
    await publicacionService.toggleActivo(req.params.id, true);
    return apiResponse.noContent(res);
  }),

  deletePublicacion: catchAsync(async (req, res) => {
    await publicacionService.deletePublicacion(req.params.id);
    return apiResponse.success(res, {
      message: 'Publicación eliminada correctamente',
    });
  }),
};
