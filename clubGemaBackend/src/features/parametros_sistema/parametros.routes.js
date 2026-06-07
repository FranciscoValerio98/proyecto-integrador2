import { Router } from 'express';
import { parametrosController } from './parametros.controller.js';
// Importa tus middlewares de autenticación si los tienes
// import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// CRUD de parámetros
router.get('/', parametrosController.listar);
router.get('/:clave', parametrosController.obtenerClave);
router.post('/', parametrosController.crear);
router.put('/:id', parametrosController.actualizar);
router.delete('/:id', parametrosController.eliminar);

export default router;