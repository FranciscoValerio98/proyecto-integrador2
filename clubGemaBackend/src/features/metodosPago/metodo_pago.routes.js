import { Router } from 'express';
import { metodoPagoController } from './metodo_pago.controller.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';

const router = Router();

// Endpoint: GET /api/metodos-pago
router.get('/', authenticate, metodoPagoController.getAllMetodos);

export default router;