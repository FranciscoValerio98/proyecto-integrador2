import apiFetch from '../interceptors/api'; // Asegúrate de que apunte a tu apiFetch
import { API_ROUTES } from '../constants/apiRoutes';

export const feriadoService = {
    listarTodos: async () => {
        const response = await apiFetch.get(API_ROUTES.FERIADOS.BASE);
        // FETCH NECESITA .json() PARA LEER EL CUERPO
        const result = await response.json(); 
        return result; // Ahora sí devuelve { data: [...] }
    },

    crear: async (data) => {
        const response = await apiFetch.post(API_ROUTES.FERIADOS.BASE, data);
        return await response.json();
    },

    eliminar: async (id) => {
        const response = await apiFetch.delete(API_ROUTES.FERIADOS.BY_ID(id));
        return await response.json();
    }
};