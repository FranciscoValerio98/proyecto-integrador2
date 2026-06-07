import apiFetch from '../interceptors/api';
import { API_ROUTES } from '../constants/apiRoutes';

export const catalogoService = {
    // Obtener todos los conceptos (Admin)
    getAll: async () => {
        const response = await apiFetch.get(API_ROUTES.CATALOGO.BASE);
        return await response.json();
    },

    // Obtener solo los planes vigentes (Landing/Público)
    getVigentes: async () => {
        const response = await apiFetch.get(API_ROUTES.CATALOGO.VIGENTES);
        if (!response.ok) {
            throw new Error('Error al obtener planes vigentes');
        }
        return await response.json();
    }
};
