export const VALID_ROLES = {
  ALUMNO: 'alumno',
  COORDINADOR: 'coordinador',
  ADMINISTRADOR: 'administrador',
};

export const VALID_ROLES_ARRAY = Object.values(VALID_ROLES);

export const ROLES_DESCRIPTIONS = {
  [VALID_ROLES.ALUMNO]: 'Estudiante de la academia',
  [VALID_ROLES.COORDINADOR]: 'Coordinador de clases',
  [VALID_ROLES.ADMINISTRADOR]: 'Administrador del sistema',
};

export const ROLE_SPECIFIC_REQUIREMENTS = {
  [VALID_ROLES.ALUMNO]: ['condiciones_medicas', 'seguro_medico', 'grupo_sanguineo', 'direccion'],
  [VALID_ROLES.COORDINADOR]: ['especializacion'],
  [VALID_ROLES.ADMINISTRADOR]: ['cargo', 'sede_id', 'area'],
};

export const ROLE_REQUIRED_FIELDS = {
  [VALID_ROLES.ALUMNO]: [],
  [VALID_ROLES.COORDINADOR]: ['especializacion'],
  [VALID_ROLES.ADMINISTRADOR]: ['cargo'],
};

export default {
  VALID_ROLES,
  VALID_ROLES_ARRAY,
  ROLES_DESCRIPTIONS,
  ROLE_SPECIFIC_REQUIREMENTS,
  ROLE_REQUIRED_FIELDS,
};
