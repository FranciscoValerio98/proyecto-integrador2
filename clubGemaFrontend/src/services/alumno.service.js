import apiFetch from "../interceptors/api";
import { API_ROUTES } from "../constants/apiRoutes";

const alumnoService = {
  getById: async (id) => {
    const response = await apiFetch.get(API_ROUTES.USUARIOS.ALUMNO_BY_ID(id));
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Error al obtener alumno");
    }
    return result.data || result;
  },

  update: async (id, payload) => {
    const response = await apiFetch.put(API_ROUTES.USUARIOS.ALUMNO_BY_ID(id), payload);
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Error al actualizar alumno");
    }
    return result.data || result;
  },
};

export default alumnoService;
