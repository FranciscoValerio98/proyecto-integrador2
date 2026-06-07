import { rolesService } from './roles.service.js';
import { catchAsync } from '../../shared/utils/catchAsync.util.js';
import { apiResponse } from '../../shared/utils/response.util.js';

export const rolesController = {
  getAllRoles: catchAsync(async (req, res) => {
    const roles = await rolesService.getAllRoles();

    return apiResponse.success(res, {
      message: 'Roles obtenidos exitosamente',
      data: roles,
    });
  }),

  getRoleById: catchAsync(async (req, res) => {
    const role = await rolesService.getRoleById(req.params.id);

    return apiResponse.success(res, {
      message: 'Rol obtenido exitosamente',
      data: role,
    });
  }),

  getRoleByNombre: catchAsync(async (req, res) => {
    const role = await rolesService.getRoleByNombre(req.params.nombre);

    return apiResponse.success(res, {
      message: 'Rol obtenido exitosamente',
      data: role,
    });
  }),

  createRole: catchAsync(async (req, res) => {
    const role = await rolesService.createRole(req.body);

    return apiResponse.created(res, {
      message: 'Rol creado exitosamente',
      data: role,
    });
  }),

  updateRole: catchAsync(async (req, res) => {
    const role = await rolesService.updateRole(req.params.id, req.body);

    return apiResponse.success(res, {
      message: 'Rol actualizado exitosamente',
      data: role,
    });
  }),

  deleteRole: catchAsync(async (req, res) => {
    await rolesService.deleteRole(req.params.id);

    return apiResponse.success(res, {
      message: 'Rol eliminado exitosamente',
    });
  }),
};
