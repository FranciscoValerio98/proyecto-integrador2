import { Router } from 'express';
import { canchaController } from './cancha.controller.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/authorize.middleware.js';
import { validate, validateParams } from '../../shared/middlewares/validate.middleware.js';
import { canchaSchema } from './cancha.schema.js';

const router = Router();

// Rutas públicas — listar canchas
router.get('/', canchaController.getAll);
router.get('/:id', validateParams(canchaSchema.idParamSchema), canchaController.getById);

// Rutas protegidas — solo Administrador
router.post(
  '/',
  authenticate,
  authorize('Administrador'),
  validate(canchaSchema.createSchema),
  canchaController.create
);

router.put(
  '/:id',
  authenticate,
  authorize('Administrador'),
  validateParams(canchaSchema.idParamSchema),
  validate(canchaSchema.updateSchema),
  canchaController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('Administrador'),
  validateParams(canchaSchema.idParamSchema),
  canchaController.delete
);

export default router;
