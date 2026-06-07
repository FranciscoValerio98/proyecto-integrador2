import apiFetch from '../interceptors/api';
import { API_ROUTES } from '../constants/apiRoutes';

export const sedeService = {
    // Obtener todas las sedes con filtros
    getAll: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        const response = await apiFetch.get(`${API_ROUTES.SEDES.BASE}?${query}`);
        return await response.json();
    },

    // Crear una nueva sede
    create: async (sedeData) => {
        const response = await apiFetch.post(API_ROUTES.SEDES.BASE, sedeData);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al crear sede');
        }
        return await response.json();
    },

    delete: async (id) => {
        const response = await apiFetch.delete(`${API_ROUTES.SEDES.BASE}/${id}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al eliminar la sede');
        }

        return response.status === 204 ? { success: true } : await response.json();
    },

    update: async (id, sedeData) => {
        const response = await apiFetch.put(`${API_ROUTES.SEDES.BASE}/${id}`, sedeData);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al actualizar la sede');
        }

        return await response.json();
    }
};