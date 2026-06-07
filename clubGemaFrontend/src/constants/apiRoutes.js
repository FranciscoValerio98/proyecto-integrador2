export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    COMPLETAR_EMAIL: "/auth/completar-email",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    CHANGE_PASSWORD: "/auth/change-password",
    UPDATE_PROFILE: "/auth/profile",
  },
  ROLES: {
    BASE: "/roles",
  },
  HORARIOS: {
    BASE: "/horarios",
    ACTIVOS: "/horarios",
    BY_ID: (id) => `/horarios/${id}`,
  },
  USUARIOS: {
    BASE: "/usuarios",
    PROFESORES: "/usuarios/role/profesor",
    COORDINADORES: "/usuarios/role/coordinador",
    ALUMNOS: "/usuarios/role/alumno",
    ALUMNO_BY_ID: (id) => `/usuarios/${id}`,
    STATS: "/usuarios/count/usuarios-stats",
    REPORTE: "/usuarios/reporte/detallado",
    REGISTER: "/usuarios/register",
  },
  INSCRIPCIONES: {
    BASE: "/inscripciones",
    SEPARAR_FINALIZAR: (id) => `/inscripciones/${id}/separar-finalizar`,
    ACTUALIZAR_FECHA_PAQUETE: (cuentaId) => `/inscripciones/paquete/fecha/${cuentaId}`,
  },
  PAGOS: {
    BASE: "/pagos",
    BASEADMIN:"/pagos/gestion-admin",
    ALUMNO_HISTORIAL: (id) => `/pagos/alumno/${id}`,
    REPORTAR: "/pagos/reportar",
    VALIDAR: "/pagos/validar",
    DETALLE_MAESTRO: (id) => `/pagos/detalle-maestro/${id}`,
  },
  SEDES: {
    BASE: "/sedes",
    ACTIVOS: "/sedes?activo=true&limit=100",
    OCUPACION: "/sedes/dashboard/ocupacion",
    BY_ID: (id) => `/sedes/${id}`,
  },
  RECUPERACIONES: {
    BASE: "/recuperaciones",
    HISTORIAL: "/recuperaciones/historial",
    ALUMNO_HISTORIAL: (id) => `/recuperaciones/alumno/${id}`,
    ELIMINAR: (id) => `/recuperaciones/${id}`,
    LISTAR_DEPURACION: "/recuperaciones/depuracion",
  },
  CANCHAS: {
    BASE: "/canchas",
    ACTIVAS: "/canchas/activas",
  },
  NIVELES: {
    BASE: "/niveles",
    ACTIVOS: "/niveles",
    BY_ID: (id) => `/niveles/${id}`,
  },
  TIPOS_BENEFICIO: {
    BASE: "/tipos-beneficio",
    BY_ID: (id) => `/tipos-beneficio/${id}`,
  },
  DESCUENTOS: {
    APLICAR: "/descuentos/aplicar",
  },
  ASISTENCIAS: {
    BASE: "/asistencias",
    PREVISUALIZAR: "/asistencias/previsualizar-fechas",
    ALUMNO_HISTORIAL: (id) => `/asistencias/alumno/${id}`,
    ALUMNO_ESTADISTICAS: (id) => `/asistencias/alumno/${id}/estadisticas`,
  },
  CUENTAS_POR_COBRAR: {
    BASE: "/cuentas-por-cobrar",
    HISTORIAL: (id) => `/cuentas-por-cobrar/historial/${id}`,
    SUGERIR_FECHA: (id) => `/cuentas-por-cobrar/renovacion-sugerida/${id}`,
    GENERAR_ADELANTADO: (id) => `/cuentas-por-cobrar/generar-adelantado/${id}`,
  },
  CLASES: {
    BASE: "/clases",
    REPROGRAMAR_MASIVO: "/clases/reprogramar-masivo",
    REVERTIR_MASIVO: "/clases/revertir-masivo",
    ACTIVAS_MASIVAS: "/clases/reprogramaciones-masivas-activas",
    HORARIOS_CON_ASISTENCIA: "/clases/horarios-con-asistencia",
  },
  CATALOGO: {
    BASE: "/catalogo",
    ACTIVOS: "/catalogo/activos",
    VIGENTES: "/catalogo/vigentes",
    BY_ID: (id) => `/catalogo/${id}`,
  },
  PARAMETROS: {
    BASE: "/parametros",
    BY_ID: (id) => `/parametros/${id}`,
  },
  CLOUDINARY: {
    BASE: "/cloudinary",
  },
  LESIONES: {
    BASE: "/lesiones",
    ALUMNO: (id) => `/lesiones/alumno/${id}`,
  },
  TIPOS_DOCUMENTO: {
    BASE: "/tipos-documento",
  },
  BENEFICIOS_PENDIENTES: {
    BASE: "/beneficioPendiente",
  },
  ALUMNOS: {
    BASE: "/alumnos",
    MI_PERFIL: "/alumno/mi-perfil",
    DIA_CORTE : "/alumno/gestion/resumen-cortes",
    DIA_CORTE_COORDINADOR: "/alumno/gestion/cortes-alumnos",
  },
  PUBLICACIONES: {
    BASE: "/publicaciones",
    BY_ID: (id) => `/publicaciones/${id}`,
  },
  NOTIFICACIONES: {
    BASE: "/notificaciones",
    MARCAR_LEIDA: (id) => `/notificaciones/${id}/leer`,
  },
  METODOS_PAGO: {
    BASE: "/metodos-pago",
  },
  COORDINADORES: {
    BASE: "/coordinadores",
    BY_ID: (id) => `/coordinadores/${id}`,
  },
  FERIADOS: {
    BASE: "/feriados",
    BY_ID: (id) => `/feriados/${id}`,
  },
  ANUNCIOS_BENEFICIOS: {
    BASE: '/anuncios-beneficios',
    ACTIVOS: '/anuncios-beneficios/activos'
  },
};
