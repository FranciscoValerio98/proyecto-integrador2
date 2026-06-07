import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const BeneficiosPendientesService = {
  // 1. Asignar un beneficio futuro a un alumno
  async asignarBeneficio(data) {
    const { alumno_id, tipo_beneficio_id, asignado_por, motivo } = data;
    
    return await prisma.beneficios_pendientes.create({
      data: {
        alumno_id: parseInt(alumno_id),
        tipo_beneficio_id: parseInt(tipo_beneficio_id),
        asignado_por: parseInt(asignado_por),
        motivo,
        usado: false // Siempre nace como no usado
      },
      include: {
        tipos_beneficio: true,
        alumnos: {
          include: { usuarios: true }
        }
      }
    });
  },

  // 2. Obtener beneficios que el alumno tiene "en cola"
  async listarPorAlumno(alumnoId) {
    return await prisma.beneficios_pendientes.findMany({
      where: {
        alumno_id: parseInt(alumnoId),
        usado: false
      },
      include: {
        tipos_beneficio: true
      },
      orderBy: { fecha_asignacion: 'desc' }
    });
  }
};