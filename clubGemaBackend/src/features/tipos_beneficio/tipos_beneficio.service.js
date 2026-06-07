import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const TiposBeneficioService = {
  // Crear el tipo de beneficio
  async create(data) {
    return await prisma.tipos_beneficio.create({
      data: {
        nombre: data.nombre,
        es_porcentaje: data.es_porcentaje,
        valor_por_defecto: data.valor_por_defecto,
        activo: true
      }
    });
  },

  // Listar todos
 async getAll() {
    // Eliminamos el 'where' para que traiga activos e inactivos
    return await prisma.tipos_beneficio.findMany({
      orderBy: {
        id: 'asc' // Opcional: para que siempre salgan en el mismo orden
      }
    });
  },
async update(id, data) {
    return await prisma.tipos_beneficio.update({
      where: { id: parseInt(id) },
      data: {
        nombre: data.nombre,
        es_porcentaje: data.es_porcentaje,
        valor_por_defecto: data.valor_por_defecto,
        activo: data.activo !== undefined ? data.activo : true
      }
    });
  },

  // Borrado lógico (recomendado)
  async delete(id) {
    return await prisma.tipos_beneficio.update({
      where: { id: parseInt(id) },
      data: { activo: false }
    });
  }
};