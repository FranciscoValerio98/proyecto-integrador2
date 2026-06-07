import { Router } from 'express';
import { feriadoController } from './feriado.controller.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/authorize.middleware.js';

const router = Router();

router.use(authenticate);

// Todos pueden ver los feriados
router.get('/', feriadoController.listar);

// Solo el Admin puede gestionar el calendario
router.post('/', authorize('Administrador'), feriadoController.crear);
router.patch('/:id', authorize('Administrador'), feriadoController.actualizar);
router.delete('/:id', authorize('Administrador'), feriadoController.eliminar);

export default router;