import { tipoDocumentosService } from './tipo_documento.service.js';
import { catchAsync } from '../../shared/utils/catchAsync.util.js';
import { apiResponse } from '../../shared/utils/response.util.js';

export const tipoDocumentosController = {
    getAllTipoDocumentos: catchAsync(async (req, res) => {
        const tipoDocumentos = await tipoDocumentosService.getAllTipoDocumentos();

        return apiResponse.success(res, {
            message: 'Tipos de documentos obtenidos exitosamente',
            data: tipoDocumentos,
        });
    }),

    getTipoDocumentoById: catchAsync(async (req, res) => {
        // Eliminamos parseInt porque el ID es un String (ej: 'DNI')
        const id = req.params.id;
        const tipoDocumento = await tipoDocumentosService.getTipoDocumentoById(id);

        return apiResponse.success(res, {
            message: 'Tipo de documento obtenido exitosamente',
            data: tipoDocumento,
        });
    }),

    createTipoDocumento: catchAsync(async (req, res) => {
        // req.body debe contener { id, descripcion }
        const tipoDocumento = await tipoDocumentosService.createTipoDocumento(req.body);

        return apiResponse.success(res, {
            message: 'Tipo de documento creado exitosamente',
            data: tipoDocumento,
        });
    }),

    updateTipoDocumento: catchAsync(async (req, res) => {
        const id = req.params.id; // Sin parseInt
        const tipoDocumento = await tipoDocumentosService.updateTipoDocumento(id, req.body);

        return apiResponse.success(res, {
            message: 'Tipo de documento actualizado exitosamente',
            data: tipoDocumento,
        });
    }),

    deleteTipoDocumento: catchAsync(async (req, res) => {
        const id = req.params.id; // Sin parseInt
        await tipoDocumentosService.deleteTipoDocumento(id);

        return apiResponse.success(res, {
            message: 'Tipo de documento eliminado exitosamente',
        });
    }),
};