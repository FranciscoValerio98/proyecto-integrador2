import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/authorize.middleware.js';
import { asistenteController } from './asistente.controller.js';

const router = Router();

router.use(authenticate);
router.use(authorize('Administrador', 'Alumno'));

router.post('/procesar', asistenteController.procesarComandoVoz);

export default router;