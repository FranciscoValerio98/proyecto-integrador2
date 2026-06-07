import { lesionService } from './lesion.service.js';
import { catchAsync } from '../../shared/utils/catchAsync.util.js';
import { apiResponse } from '../../shared/utils/response.util.js';
import { ApiError } from '../../shared/utils/error.util.js';

// ALUMNO: Crear nueva solicitud
const crearSolicitud = catchAsync(async (req, res) => {
    const { id: alumnoId } = req.user;
    const { descripcion } = req.body;
    const evidenciaFile = req.file;

    if (!descripcion || !evidenciaFile) {
        throw new ApiError('Descripción y evidencia médica son obligatorias.', 400);
    }

    const solicitud = await lesionService.crearSolicitud(alumnoId, {
        descripcion,
        evidenciaFile
    });

    return apiResponse.created(res, { data: solicitud, message: 'Solicitud de lesión enviada correctamente.' });
});

// ALUMNO: Ver su historial
const obtenerMisSolicitudes = catchAsync(async (req, res) => {
    const { id: alumnoId } = req.user;
    const solicitudes = await lesionService.obtenerMisSolicitudes(alumnoId);
    return apiResponse.success(res, { data: solicitudes, message: 'Historial de solicitudes obtenido.' });
});

// ADMIN: Ver pendientes
const obtenerPendientes = catchAsync(async (req, res) => {
    const pendientes = await lesionService.obtenerPendientes();
    return apiResponse.success(res, { data: pendientes, message: 'Solicitudes pendientes obtenidas.' });
});

// ADMIN: Evaluar (Aprobar/Rechazar)
const evaluarSolicitud = catchAsync(async (req, res) => {
    const { id: adminId } = req.user;
    const { solicitudId } = req.params;
    const {
        estado,
        notas,
        tipo,        // 'RANGO' o 'INDEFINIDO'
        fechaInicio,
        fechaFin
    } = req.body;

    // 1. Validaciones de entrada
    if (!['APROBADA', 'RECHAZADA'].includes(estado)) {
        throw new ApiError('Estado inválido. Debe ser APROBADA o RECHAZADA.', 400);
    }

    // Si aprueba, exigimos datos extra
    if (estado === 'APROBADA') {
        if (!tipo || !fechaInicio) {
            throw new ApiError('Para aprobar, es obligatorio indicar el tipo (RANGO/INDEFINIDO) y la fecha de inicio.', 400);
        }
        if (tipo === 'RANGO' && !fechaFin) {
            throw new ApiError('Para lesiones de tipo RANGO, la fecha fin es obligatoria.', 400);
        }
    }

    // 2. Llamada al servicio
    const resultado = await lesionService.evaluarSolicitud({
        solicitudId,
        estado,
        adminId,
        notas,
        tipo,
        fechaInicio,
        fechaFin
    });

    return apiResponse.success(res, { data: resultado, message: `Solicitud ${estado} correctamente.` });
});

export const lesionController = {
    crearSolicitud,
    obtenerMisSolicitudes,
    obtenerPendientes,
    evaluarSolicitud
};