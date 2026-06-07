import { Router } from 'express';
import { nivelController } from './niveles.controller.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/authorize.middleware.js';
import { validate, validateParams } from '../../shared/middlewares/validate.middleware.js';
import { nivelesSchema } from './niveles.schema.js';

const router = Router();

// Ruta pública — listar niveles disponibles
router.get('/', nivelController.getAllNiveles);

// Rutas protegidas — solo Administrador
router.post(
  '/',
  authenticate,
  authorize('Administrador'),
  validate(nivelesSchema.createNivelSchema),
  nivelController.createNivel
);

router.put(
  '/:id',
  authenticate,
  authorize('Administrador'),
  validateParams(nivelesSchema.idParamSchema),
  validate(nivelesSchema.updateNivelSchema),
  nivelController.updateNivel
);

router.delete(
  '/:id',
  authenticate,
  authorize('Administrador'),
  validateParams(nivelesSchema.idParamSchema),
  nivelController.deleteNivel
);

export default router;
