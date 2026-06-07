import { nivelService } from './niveles.service.js';
import { catchAsync } from '../../shared/utils/catchAsync.util.js';
import { apiResponse } from '../../shared/utils/response.util.js';

export const nivelController = {
  createNivel: catchAsync(async (req, res) => {
    const nivel = await nivelService.createNivel(req.body);
    return apiResponse.created(res, {
      message: 'Nivel creado exitosamente',
      data: nivel,
    });
  }),

  getAllNiveles: catchAsync(async (req, res) => {
    const niveles = await nivelService.getAllNiveles();
    return apiResponse.success(res, {
      message: 'Niveles obtenidos exitosamente',
      data: niveles,
    });
  }),

  updateNivel: catchAsync(async (req, res) => {
    const nivel = await nivelService.updateNivel(req.params.id, req.body);
    return apiResponse.success(res, {
      message: 'Nivel actualizado exitosamente',
      data: nivel,
    });
  }),

  deleteNivel: catchAsync(async (req, res) => {
    await nivelService.deleteNivel(req.params.id);
    return apiResponse.success(res, {
      message: 'Nivel eliminado exitosamente',
    });
  }),
};
