import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const parametrosService = {
    // Obtener todos los parámetros
    obtenerTodos: async () => {
        return await prisma.parametros_sistema.findMany({
            orderBy: { clave: 'asc' }
        });
    },

    // Obtener un parámetro por su clave (útil para la lógica de negocio)
    obtenerPorClave: async (clave) => {
        return await prisma.parametros_sistema.findUnique({
            where: { clave }
        });
    },

    // Crear un nuevo parámetro
    crear: async (data) => {
        return await prisma.parametros_sistema.create({
            data: {
                clave: data.clave.toUpperCase(),
                valor: data.valor,
                descripcion: data.descripcion
            }
        });
    },

    // Actualizar un parámetro
    actualizar: async (id, data) => {
        return await prisma.parametros_sistema.update({
            where: { id: parseInt(id) },
            data: {
                valor: data.valor,
                descripcion: data.descripcion
                // La clave generalmente no se edita para no romper la lógica interna
            }
        });
    },

    // Eliminar un parámetro
    eliminar: async (id) => {
        return await prisma.parametros_sistema.delete({
            where: { id: parseInt(id) }
        });
    }
};