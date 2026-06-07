import { notificacionesService } from './notificaciones.service.js';

export const getNotificaciones = async (req, res) => {
  try {
    // 🔥 ¡AQUÍ ESTÁ LA MAGIA QUE EVITA EL ERROR 500!
    const usuarioId = Number(req.user.id); 
    
    const data = await notificacionesService.obtenerPorUsuario(usuarioId);
    
    // Mandamos data || [] para que el Frontend nunca reciba un undefined y explote
    res.json({ success: true, data: data || [] }); 
  } catch (error) {
    console.error("Error en getNotificaciones:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Nuevo controlador para el conteo
export const getConteoNoLeidas = async (req, res) => {
  try {
    // 🔥 ¡AQUÍ TAMBIÉN!
    const usuarioId = Number(req.user.id); 
    
    const conteo = await notificacionesService.obtenerConteoNoLeidas(usuarioId);
    res.json({ success: true, data: conteo || 0 });
  } catch (error) {
    console.error("Error en getConteo:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const patchMarcarLeida = async (req, res) => {
  try {
    const { id } = req.params;
    await notificacionesService.marcarComoLeida(id);
    res.json({ success: true, message: 'Notificación leída' });
  } catch (error) {
    console.error("Error en patchMarcarLeida:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};