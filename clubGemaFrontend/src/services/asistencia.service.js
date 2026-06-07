import apiFetch from '../interceptors/api';
import { API_ROUTES } from '../constants/apiRoutes';

export const asistenciaService = {
    /**
     * Obtiene la agenda general para el coordinador logueado.
     */
    getAgenda: async () => {
        const response = await apiFetch.get(`${API_ROUTES.ASISTENCIAS.BASE}/agenda`);

        if (!response.ok) {
            throw new Error('Error al cargar la agenda de entrenamiento');
        }

        const result = await response.json();
        return result.data;
    },

    /**
     * ✅ NUEVA FUNCIÓN: Envía el array de asistencias al nuevo endpoint del backend
     * @param {Array} asistencias - Ejemplo: [{id: 44, estado: 'PRESENTE'}, {id: 45, estado: 'FALTA'}]
     */
    marcarAsistenciaMasiva: async (asistencias) => {
        // Apuntamos al endpoint POST /masiva que creamos en el backend
        const response = await apiFetch.post(`${API_ROUTES.ASISTENCIAS.BASE}/masiva`, {
            asistencias // El body debe coincidir con lo que espera tu controlador
        });

        if (!response.ok) {
            throw new Error('No se pudo procesar la asistencia grupal');
        }

        return await response.json();
    },

    /**
     * Actualiza un alumno de forma individual (Patch)
     */
    marcarAsistencia: async (asistenciaId, estado, comentario = "") => {
        const response = await apiFetch.patch(`${API_ROUTES.ASISTENCIAS.BASE}/${asistenciaId}`, {
            estado,
            comentario
        });

        if (!response.ok) {
            throw new Error('No se pudo actualizar la asistencia individual');
        }

        return await response.json();
    }
};