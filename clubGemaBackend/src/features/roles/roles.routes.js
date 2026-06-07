import { Router } from 'express';
import { rolesController } from './roles.controller.js';
import { rolesSchema } from './roles.schema.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/authorize.middleware.js';
import { validate, validateParams } from '../../shared/middlewares/validate.middleware.js';

const router = Router();

// Rutas públicas - Listar roles (para que usuarios puedan ver opciones al registrarse)
router.get('/', rolesController.getAllRoles);
router.get('/:id', validateParams(rolesSchema.idParamSchema), rolesController.getRoleById);
router.get(
  '/nombre/:nombre',
  validateParams(rolesSchema.nombreParamSchema),
  rolesController.getRoleByNombre
);

// Rutas protegidas - Solo administradores pueden crear/modificar/eliminar roles
router.post(
  '/',
  authenticate,
  authorize('Administrador'),
  validate(rolesSchema.crearRolSchema),
  rolesController.createRole
);
router.put(
  '/:id',
  authenticate,
  authorize('Administrador'),
  validateParams(rolesSchema.idParamSchema),
  validate(rolesSchema.actualizarRolSchema),
  rolesController.updateRole
);
router.delete(
  '/:id',
  authenticate,
  authorize('Administrador'),
  validateParams(rolesSchema.idParamSchema),
  rolesController.deleteRole
);

export default router;
