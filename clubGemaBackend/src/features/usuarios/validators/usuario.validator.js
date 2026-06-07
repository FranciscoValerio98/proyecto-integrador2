import {
  VALID_ROLES,
  VALID_ROLES_ARRAY,
  ROLE_REQUIRED_FIELDS,
} from '../../roles/roles.constants.js';

export const isValidRole = (rol) => {
  if (!rol || typeof rol !== 'string') return false;
  return VALID_ROLES_ARRAY.includes(rol.toLowerCase());
};

export const normalizeRole = (rol) => {
  if (!rol) return null;
  const normalized = rol.toLowerCase().trim();
  return isValidRole(normalized) ? normalized : null;
};

export const getBdRoleName = (rol) => {
  if (!isValidRole(rol)) return null;
  return rol.charAt(0).toUpperCase() + rol.slice(1).toLowerCase();
};

export const validateRoleSpecificData = (rol, datos = {}) => {
  const normalizedRol = normalizeRole(rol);

  if (!normalizedRol) {
    return {
      valid: false,
      errors: [`Rol '${rol}' inválido. Valores permitidos: ${VALID_ROLES_ARRAY.join(', ')}`],
    };
  }

  const errors = [];

  const requiredFields = ROLE_REQUIRED_FIELDS[normalizedRol] || [];
  requiredFields.forEach((field) => {
    if (!datos[field] || datos[field].toString().trim() === '') {
      errors.push(`Campo obligatorio "${field}" faltante para el rol ${normalizedRol}`);
    }
  });

  switch (normalizedRol) {
    case VALID_ROLES.ALUMNO:
      if (!datos.direccion) {
        errors.push('La dirección es obligatoria para el rol alumno');
      } else {
        const { direccion_completa, distrito, ciudad, referencia } = datos.direccion;
        if (!direccion_completa || direccion_completa.toString().trim().length < 3) {
          errors.push('La dirección debe tener al menos 3 caracteres');
        }
        if (!distrito || distrito.toString().trim().length < 1) {
          errors.push('El distrito es requerido');
        }
        if (ciudad !== undefined && ciudad !== null && ciudad.toString().trim().length < 1) {
          errors.push('La ciudad es requerida');
        }
        if (
          referencia !== undefined &&
          referencia !== null &&
          referencia.toString().trim().length < 1
        ) {
          errors.push('La referencia es requerida');
        }
      }
      if (datos.grupo_sanguineo) {
        const gruposSanguineos = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
        if (!gruposSanguineos.includes(datos.grupo_sanguineo)) {
          errors.push(
            `Grupo sanguíneo inválido. Valores permitidos: ${gruposSanguineos.join(', ')}`
          );
        }
      }
      break;

    case VALID_ROLES.COORDINADOR:
      if (datos.tarifa_hora !== undefined) {
        const tarifa = parseFloat(datos.tarifa_hora);
        if (isNaN(tarifa) || tarifa <= 0) {
          errors.push('Tarifa por hora debe ser un número positivo');
        }
        if (tarifa > 9999) {
          errors.push('Tarifa por hora no puede ser mayor a 9999');
        }
      }
      break;

    case VALID_ROLES.ADMINISTRADOR:
      if (datos.sede_id !== undefined && datos.sede_id !== null) {
        if (!Number.isInteger(datos.sede_id) || datos.sede_id <= 0) {
          errors.push('Sede ID debe ser un número entero positivo');
        }
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const getValidRoles = () => {
  return [...VALID_ROLES_ARRAY];
};

export const canCreateUserRole = (rolUsuarioActual, rolACrear) => {
  const actualNormalized = normalizeRole(rolUsuarioActual);
  const crearNormalized = normalizeRole(rolACrear);
  if (actualNormalized !== VALID_ROLES.ADMINISTRADOR) {
    return false;
  }

  return isValidRole(crearNormalized);
};

export const getInvalidRoleMessage = () => {
  return (
    `Rol inválido. Los roles permitidos son: ${VALID_ROLES_ARRAY.join(', ')}. ` +
    `Ejemplo: {"rol_id": "alumno"}`
  );
};
