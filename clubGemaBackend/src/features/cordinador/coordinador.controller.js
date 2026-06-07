import { coordinadorService } from './coordinador.service.js';
import { catchAsync } from '../../shared/utils/catchAsync.util.js';
import { apiResponse } from '../../shared/utils/response.util.js';

export const coordinadorController = {
    listar: catchAsync(async (req, res) => {
        const data = await coordinadorService.listarTodos();
        return apiResponse.success(res, { data, message: 'Staff de coordinadores recuperado.' });
    }),

    obtenerDetalle: catchAsync(async (req, res) => {
        const { id } = req.params;
        const data = await coordinadorService.obtenerPorId(id);
        return apiResponse.success(res, { data });
    }),

    actualizar: catchAsync(async (req, res) => {
        const { id } = req.params;
        const data = await coordinadorService.actualizar(id, req.body);
        return apiResponse.success(res, { data, message: 'Expediente actualizado correctamente.' });
    }),

    eliminar: catchAsync(async (req, res) => {
        const { id } = req.params;
        await coordinadorService.eliminar(id);
        return apiResponse.success(res, { message: 'Coordinador dado de baja del sistema.' });
    })
};