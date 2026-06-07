import { Router } from 'express';
import { TiposBeneficioController } from './tipos_beneficio.controller.js';

const router = Router();

router.post('/', TiposBeneficioController.crear);
router.get('/', TiposBeneficioController.listar);
router.put('/:id', TiposBeneficioController.actualizar);   // Nueva ruta
router.delete('/:id', TiposBeneficioController.eliminar); // Nueva ruta
export default router;