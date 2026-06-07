import { Router } from 'express';
import { BeneficiosPendientesController } from './beneficios-pendientes.controller.js';

const router = Router();

// POST /api/beneficios-pendientes
// Body: { alumno_id, tipo_beneficio_id, asignado_por, motivo }
router.post('/', BeneficiosPendientesController.crear);

// GET /api/beneficios-pendientes/alumno/10
router.get('/alumno/:alumnoId', BeneficiosPendientesController.obtenerPorAlumno);

export default router;