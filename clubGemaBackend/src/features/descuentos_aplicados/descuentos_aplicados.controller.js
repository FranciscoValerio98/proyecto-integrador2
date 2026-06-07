import { DescuentosAplicadosService } from './descuentos_aplicados.service.js';
import { catchAsync } from '../../shared/utils/catchAsync.util.js';
import { apiResponse } from '../../shared/utils/response.util.js';

export const DescuentosAplicadosController = {
  aplicarBeneficio: catchAsync(async (req, res) => {
    const { cuenta_id, tipo_beneficio_id, motivo } = req.body;

    // Obtenemos el ID del Admin creador desde el JWT token, NUNCA desde un request payload.
    const admin_id = req.user.id;

    // Los datos numéricos de cuenta_id y tipo_beneficio_id ya están limpiados y coercionados por Zod.
    const result = await DescuentosAplicadosService.aplicar({
      cuenta_id,
      tipo_beneficio_id,
      admin_id,
      motivo,
    });

    return apiResponse.created(res, {
      message: `S/ ${result.descuentoFinal.toFixed(2)} descontados correctamente.`,
      data: result.descuento,
    });
  }),

  // Nuevo endpoint que estaba en service pero inalcanzable
  eliminarBeneficio: catchAsync(async (req, res) => {
    const descuento_id = req.params.id; // Limpio por Zod
    const restaurarBeneficio = req.query.restaurar_beneficio || false;

    await DescuentosAplicadosService.eliminar(descuento_id, restaurarBeneficio);

    return apiResponse.success(res, {
      message: 'Descuento revertido satisfactoriamente',
    });
  }),

  verHistorialCuenta: catchAsync(async (req, res) => {
    const cuentaId = req.params.cuentaId; // Ya es number gracias a Zod coercion.

    const result = await DescuentosAplicadosService.obtenerPorCuenta(cuentaId);
    return apiResponse.success(res, {
      message: 'Historial obtenido',
      data: result,
    });
  }),
};
