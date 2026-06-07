import { Router } from 'express';
import * as notificacionesController from './notificaciones.controller.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js'; // Asegúrate de que la ruta sea correcta

const router = Router();

// 🔥 Protegemos TODAS las rutas de notificaciones para saber quién las pide
router.use(authenticate);

// GET /api/notificaciones/conteo-no-leidas (Debe ir ANTES del /:id si tuvieras uno, por seguridad)
router.get('/conteo-no-leidas', notificacionesController.getConteoNoLeidas);

// GET /api/notificaciones
router.get('/', notificacionesController.getNotificaciones);

// PATCH /api/notificaciones/:id/leer
router.patch('/:id/leer', notificacionesController.patchMarcarLeida);

export default router;