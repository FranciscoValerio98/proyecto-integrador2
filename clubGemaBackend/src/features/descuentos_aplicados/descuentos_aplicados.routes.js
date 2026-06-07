import { Router } from 'express';
import { DescuentosAplicadosController } from './descuentos_aplicados.controller.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/authorize.middleware.js';
import { validate, validateParams } from '../../shared/middlewares/validate.middleware.js';
import { descuentosAplicadosSchema } from './descuentos_aplicados.schema.js';

const router = Router();

// Todas las rutas de Descuentos requieren autenticación mínima
router.use(authenticate);

// POST: Para aplicar el descuento (Solo Administrador)
router.post(
  '/aplicar',
  authorize('Administrador'),
  validate(descuentosAplicadosSchema.aplicarSchema),
  DescuentosAplicadosController.aplicarBeneficio
);

// DELETE: Para revertir un descuento aplicado (Nuevo endpoint expuesto)
router.delete(
  '/:id',
  authorize('Administrador'),
  validateParams(descuentosAplicadosSchema.descuentoIdParamSchema),
  validate(descuentosAplicadosSchema.eliminarQuerySchema, 'query'),
  DescuentosAplicadosController.eliminarBeneficio
);

// GET: Para ver qué descuentos tiene una cuenta (Admins / Coordinadores)
router.get(
  '/cuenta/:cuentaId',
  authorize('Administrador', 'Coordinador'),
  validateParams(descuentosAplicadosSchema.cuentaIdParamSchema),
  DescuentosAplicadosController.verHistorialCuenta
);

export default router;
