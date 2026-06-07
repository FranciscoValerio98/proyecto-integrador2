import { feriadoService } from './feriado.service.js';
import { catchAsync } from '../../shared/utils/catchAsync.util.js';
import { apiResponse } from '../../shared/utils/response.util.js';

export const feriadoController = {
    listar: catchAsync(async (req, res) => {
        const data = await feriadoService.listarTodos();
        return apiResponse.success(res, { data, message: 'Calendario de feriados recuperado.' });
    }),

    crear: catchAsync(async (req, res) => {
        const data = await feriadoService.crear(req.body);
        return apiResponse.success(res, { data, message: 'Feriado registrado correctamente.' });
    }),

    actualizar: catchAsync(async (req, res) => {
        const { id } = req.params;
        const data = await feriadoService.actualizar(id, req.body);
        return apiResponse.success(res, { data, message: 'Feriado actualizado.' });
    }),

    eliminar: catchAsync(async (req, res) => {
        const { id } = req.params;
        await feriadoService.eliminar(id);
        return apiResponse.success(res, { message: 'Feriado eliminado del calendario.' });
    })
};