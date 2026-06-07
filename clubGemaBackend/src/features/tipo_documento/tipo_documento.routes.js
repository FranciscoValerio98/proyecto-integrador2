import { Router } from 'express';
import { tipoDocumentosController } from './tipo_documento.controller.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/authorize.middleware.js';
import { validate, validateParams } from '../../shared/middlewares/validate.middleware.js';
import { tipoDocumentoSchema } from './tipo_documento.schema.js';

const router = Router();

/**
 * RUTAS PÚBLICAS
 * Accesibles para que los usuarios vean las opciones disponibles (DNI, CE, etc.) al registrarse.
 */
router.get('/', tipoDocumentosController.getAllTipoDocumentos);

// Esta ruta ahora recibe el código del documento directamente como string (ej: /api/tipo-documentos/DNI)
router.get(
  '/:id',
  validateParams(tipoDocumentoSchema.idParamSchema),
  tipoDocumentosController.getTipoDocumentoById
);

/**
 * RUTAS PROTEGIDAS
 * Solo usuarios con rol 'Administrador' pueden gestionar el catálogo.
 */
router.post(
  '/',
  authenticate,
  authorize('Administrador'),
  validate(tipoDocumentoSchema.createSchema),
  tipoDocumentosController.createTipoDocumento
);

router.put(
  '/:id',
  authenticate,
  authorize('Administrador'),
  validateParams(tipoDocumentoSchema.idParamSchema),
  validate(tipoDocumentoSchema.updateSchema),
  tipoDocumentosController.updateTipoDocumento
);

router.delete(
  '/:id',
  authenticate,
  authorize('Administrador'),
  validateParams(tipoDocumentoSchema.idParamSchema),
  tipoDocumentosController.deleteTipoDocumento
);

export default router;
