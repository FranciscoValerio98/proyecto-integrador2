import { asistenteService } from './asistente.service.js';
import { apiResponse } from '../../shared/utils/response.util.js';

export const asistenteController = {
    procesarComandoVoz: async (req, res) => {
        try {
            const { texto, userId, rol } = req.body;

            const iaData = await asistenteService.procesarComandoVoz(texto, userId, rol);

            return apiResponse.success(res, {
                data: iaData,
                message: 'Respuesta de IA generada correctamente.'
            })
        } catch (error) {
            console.error("Error en el asistente de voz:", error);
            return apiResponse.error(res, error.message || "Error procesando el comando de voz.", error.status || 500)
        }
    },
}