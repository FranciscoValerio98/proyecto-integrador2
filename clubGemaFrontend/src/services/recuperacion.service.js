import apiFetch from "../interceptors/api";
import { API_ROUTES } from "../constants/apiRoutes";

const recuperacionService = {
    // Obtener tickets pendientes (Normales y Lesión)
    obtenerPendientes: async () => {
        const response = await apiFetch.get(`${API_ROUTES.RECUPERACIONES.BASE}/pendientes`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Error al obtener recuperaciones");
        return result.data;
    },

    // Canjear el ticket
    agendar: async (data) => {
        // data = { alumnoId, recuperacionId, horarioDestinoId, fechaProgramada }
        const response = await apiFetch.post(`${API_ROUTES.RECUPERACIONES.BASE}/agendar-recuperacion`, data);
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Error al agendar");
        return result.data;
    },

    cancelar: async (recuperacionId) => {
        const response = await apiFetch.post(`${API_ROUTES.RECUPERACIONES.BASE}/cancelar-recuperacion/${recuperacionId}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Error al cancelar recuperación");
        return result.data;
    },

    obtenerHistorial: async () => {
        const response = await apiFetch.get(`${API_ROUTES.RECUPERACIONES.BASE}/historial`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Error al obtener historial");
        return result.data;
    },
};

export default recuperacionService;