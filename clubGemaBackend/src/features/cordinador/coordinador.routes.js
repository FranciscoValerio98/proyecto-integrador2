import { Router } from 'express';
import { coordinadorController } from './coordinador.controller.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/authorize.middleware.js';

const router = Router();

router.use(authenticate);
router.use(authorize('Administrador', 'Coordinador'));

router.get('/', coordinadorController.listar);
router.get('/:id', coordinadorController.obtenerDetalle);
router.patch('/:id', coordinadorController.actualizar);
router.delete('/:id', coordinadorController.eliminar);

export default router;