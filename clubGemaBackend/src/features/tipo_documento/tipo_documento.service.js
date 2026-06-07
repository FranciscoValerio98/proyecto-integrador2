import { prisma } from '../../config/database.config.js';
import { ApiError } from '../../shared/utils/error.util.js';

export const tipoDocumentosService = {
    createTipoDocumento: async (tipoDocumentoData) => {
        const { id, descripcion } = tipoDocumentoData;

        // El ID es el código (ej: 'DNI', 'CE') y es la llave primaria String
        const idNormalizado = id.toUpperCase().trim();

        const existing = await prisma.tipos_documento.findUnique({
            where: { id: idNormalizado },
        });

        if (existing) {
            throw new ApiError('El código de tipo de documento ya existe', 400);
        }

        return await prisma.tipos_documento.create({
            data: {
                id: idNormalizado,
                descripcion,
            },
        });
    },

    getAllTipoDocumentos: async () => {
        return await prisma.tipos_documento.findMany({
            orderBy: { id: 'asc' }
        });
    },

    getTipoDocumentoById: async (id) => {
        const tipoDocumento = await prisma.tipos_documento.findUnique({
            where: { id },
        });

        if (!tipoDocumento) {
            throw new ApiError('El tipo de documento no existe', 404);
        }
        return tipoDocumento;
    },

    updateTipoDocumento: async (id, data) => {
        // Verificamos si existe antes de actualizar
        await tipoDocumentosService.getTipoDocumentoById(id);

        return await prisma.tipos_documento.update({
            where: { id },
            data: {
                descripcion: data.descripcion,
            },
        });
    },

    deleteTipoDocumento: async (id) => {
        const tipoDocumentoExists = await prisma.tipos_documento.findUnique({
            where: { id },
        });

        if (!tipoDocumentoExists) {
            throw new ApiError('El tipo de documento no existe', 404);
        }

        // Validación de integridad referencial manual
        const usersWithTipoDocumento = await prisma.usuarios.count({
            where: { tipo_documento_id: id },
        });

        if (usersWithTipoDocumento > 0) {
            throw new ApiError(
                'No se puede eliminar porque existen usuarios asignados a este tipo de documento.',
                400
            );
        }

        return await prisma.tipos_documento.delete({
            where: { id },
        });
    },
};