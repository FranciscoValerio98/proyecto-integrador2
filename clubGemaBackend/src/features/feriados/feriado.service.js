import { prisma } from '../../config/database.config.js';

export const feriadoService = {
    listarTodos: async () => {
        return await prisma.feriados.findMany({
            orderBy: { fecha: 'asc' }
        });
    },

    crear: async (data) => {
        return await prisma.feriados.create({
            data: {
                fecha: new Date(data.fecha),
                descripcion: data.descripcion,
                activo: data.activo ?? true
            }
        });
    },

    actualizar: async (id, data) => {
        return await prisma.feriados.update({
            where: { id: parseInt(id) },
            data: {
                ...data,
                fecha: data.fecha ? new Date(data.fecha) : undefined
            }
        });
    },

    eliminar: async (id) => {
        // En feriados solemos hacer eliminación física o desactivación
        return await prisma.feriados.delete({
            where: { id: parseInt(id) }
        });
    },

    // Función extra útil para la lógica de Gema
    verificarSiEsFeriado: async (fecha) => {
        const feriado = await prisma.feriados.findUnique({
            where: { fecha: new Date(fecha) }
        });
        return !!feriado && feriado.activo;
    }
};