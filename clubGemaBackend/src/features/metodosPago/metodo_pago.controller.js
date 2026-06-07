import { metodoPagoService } from './metodo_pago.service.js';
import { apiResponse } from '../../shared/utils/response.util.js';
import { catchAsync } from '../../shared/utils/catchAsync.util.js';

export const metodoPagoController = {
  getAllMetodos: catchAsync(async (req, res) => {
    const metodos = await metodoPagoService.getAllActivos();
    return apiResponse.success(res, {
      message: 'Métodos de pago obtenidos exitosamente',
      data: metodos
    });
  })
};