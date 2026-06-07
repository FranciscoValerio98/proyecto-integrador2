import { BeneficiosPendientesService } from './beneficios-pendientes.service.js';

export const BeneficiosPendientesController = {
  async crear(req, res) {
    try {
      const beneficio = await BeneficiosPendientesService.asignarBeneficio(req.body);
      res.status(201).json({
        success: true,
        message: 'Beneficio reservado para la próxima deuda del alumno',
        data: beneficio
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al asignar beneficio pendiente',
        error: error.message
      });
    }
  },

  async obtenerPorAlumno(req, res) {
    try {
      const { alumnoId } = req.params;
      const beneficios = await BeneficiosPendientesService.listarPorAlumno(alumnoId);
      res.json({
        success: true,
        data: beneficios
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al consultar beneficios pendientes',
        error: error.message
      });
    }
  }
};