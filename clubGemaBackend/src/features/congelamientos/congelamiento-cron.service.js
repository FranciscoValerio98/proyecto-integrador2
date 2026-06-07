import { prisma } from '../../config/database.config.js';
import { logger } from '../../shared/utils/logger.util.js';

export const congelamientoCronService = {
  gestionarCongelamientos: async () => {
    const hoy = new Date();

    const rangosFinalizados = await prisma.congelamientos.updateMany({
      where: {
        estado: 'ACTIVO',
        fecha_fin: { lt: hoy },
      },
      data: {
        estado: 'FINALIZADO',
      },
    });

    if (rangosFinalizados.count > 0) {
      logger.info(`Se finalizaron ${rangosFinalizados.count} congelamientos por RANGO.`);
    }

    const indefinidosFinalizados = await prisma.congelamientos.updateMany({
      where: {
        estado: 'ACTIVO',
        fecha_fin: null,
        solicitudes_lesion: {
          recuperaciones: {
            none: {
              es_por_lesion: true,
              estado: { in: ['PENDIENTE', 'PROGRAMADA'] },
            },
          },
        },
      },
      data: {
        estado: 'FINALIZADO',
      },
    });

    if (indefinidosFinalizados.count > 0) {
      logger.info(`Se finalizaron ${indefinidosFinalizados.count} congelamientos INDEFINIDOS.`);
    }
  },
};
