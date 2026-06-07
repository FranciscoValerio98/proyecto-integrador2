import { prisma } from '../../config/database.config.js';

export const coordinadorService = {
    // Listar todos los coordinadores con sus datos de usuario
    listarTodos: async () => {
        return await prisma.usuarios.findMany({
            where: { rol_id: 'coordinador' },
            include: {
                coordinadores: true // Incluye la especialización
            },
            orderBy: { nombres: 'asc' }
        });
    },

    // Obtener un coordinador específico por ID
    obtenerPorId: async (id) => {
        return await prisma.usuarios.findUnique({
            where: { id: parseInt(id) },
            include: { coordinadores: true }
        });
    },

    // ACTUALIZAR: Esta es la función clave para tu formulario de edición
    actualizar: async (id, data) => {
        const { especializacion, ...datosUsuario } = data;

        return await prisma.$transaction(async (tx) => {
            // 1. Actualizamos la tabla base de Usuarios
            const usuarioActualizado = await tx.usuarios.update({
                where: { id: parseInt(id) },
                data: {
                    ...datosUsuario,
                    actualizado_en: new Date()
                }
            });

            // 2. Actualizamos la especialización en la tabla Coordinadores
            if (especializacion !== undefined) {
                await tx.coordinadores.upsert({
                    where: { usuario_id: parseInt(id) },
                    update: { especializacion },
                    create: { usuario_id: parseInt(id), especializacion }
                });
            }

            return usuarioActualizado;
        });
    },

    // Desactivar coordinador (Baja lógica)
    eliminar: async (id) => {
        return await prisma.usuarios.update({
            where: { id: parseInt(id) },
            data: { activo: false }
        });
    }
};