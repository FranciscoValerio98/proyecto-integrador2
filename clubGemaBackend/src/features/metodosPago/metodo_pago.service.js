import { prisma } from '../../config/database.config.js';

export const metodoPagoService = {
  /**
   * Obtiene todos los métodos de pago activos
   */
  getAllActivos: async () => {
    return await prisma.metodos_pago.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' }
    });
  },

  /**
   * Obtiene un método de pago por ID
   */
  getById: async (id) => {
    return await prisma.metodos_pago.findUnique({
      where: { id: Number(id) }
    });
  }
};