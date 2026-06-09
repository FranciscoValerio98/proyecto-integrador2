import { prisma } from '../../config/database.config.js';
import { ApiError } from '../../shared/utils/error.util.js';

const DIRECCION_SELECT = {
  select: { id: true, direccion_completa: true, distrito: true, ciudad: true, referencia: true },
};

const SEDE_SELECT_FIELDS = {
  id: true,
  nombre: true,
  telefono_contacto: true,
  distrito: true,
  activo: true,
  canchas: {
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      horarios_clases: {
        where: { activo: true },
        select: {
          id: true,
          dia_semana: true,
          hora_inicio: true,
          hora_fin: true,
          niveles_entrenamiento: true,
          usuarios: {
            select: {
              rol_id: true,
              nombres: true,
              apellidos: true,
              email: true,
              telefono_personal: true,
            }
          },
        },
      },
    },
  },
};

/**
 * Construye el objeto `where` para filtrar sedes.
 */
const buildWhereFilters = ({ activo, distrito }) => {
  const where = {};
  if (activo !== undefined) {
    where.activo = activo === true || activo === 'true';
  }
  if (distrito) {
    where.distrito = { contains: distrito, mode: 'insensitive' };
  }
  return where;
};

export const sedeService = {
  createSede: async (sedeData) => {
    const { canchas } = sedeData;

    return await prisma.$transaction(
      async (tx) => {
        const sedeCreada = await tx.sedes.create({
          data: {
            nombre: sedeData.nombre,
            telefono_contacto: sedeData.telefono_contacto || null,
            distrito: sedeData.distrito || null,
            activo: true,
          },
        });

        if (canchas && canchas.length > 0) {
          await tx.canchas.createMany({
            data: canchas.map((c) => ({
              nombre: c.nombre,
              descripcion: c.descripcion || '',
              sede_id: sedeCreada.id,
            })),
          });
        }

        return await tx.sedes.findUnique({
          where: { id: sedeCreada.id },
          select: SEDE_SELECT_FIELDS,
        });
      },
      { timeout: 10000 }
    );
  },

  getAllSedes: async (filters = {}) => {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const { page: _p, limit: _l, ...rest } = filters;

    const where = buildWhereFilters(rest);
    const skip = (page - 1) * limit;

    const [sedes, total] = await Promise.all([
      prisma.sedes.findMany({
        where,
        select: SEDE_SELECT_FIELDS,
        orderBy: { nombre: 'asc' },
        skip,
        take: limit,
      }),
      prisma.sedes.count({ where }),
    ]);

    return { sedes, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  getSedeById: async (id) => {
    const sede = await prisma.sedes.findUnique({
      where: { id },
      select: SEDE_SELECT_FIELDS,
    });

    if (!sede) throw new ApiError('Sede no encontrada', 404);

    return sede;
  },

  getCanchaForSedeCount: async (filters = {}) => {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const { page: _p, limit: _l, ...rest } = filters;

    const where = buildWhereFilters(rest);
    const skip = (page - 1) * limit;

    const [sedes, total] = await Promise.all([
      prisma.sedes.findMany({
        where,
        select: {
          id: true,
          nombre: true,
          tipo_instalacion: true,
          activo: true,
          direcciones: DIRECCION_SELECT,
          _count: { select: { canchas: true } },
        },
        orderBy: { nombre: 'asc' },
        skip,
        take: limit,
      }),
      prisma.sedes.count({ where }),
    ]);

    const sedesConConteo = sedes.map(({ _count, ...restSede }) => ({
      ...restSede,
      canchas_count: _count?.canchas ?? 0,
    }));

    return { sedes: sedesConConteo, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  updateSede: async (id, sedeData) => {
    return await prisma.$transaction(async (tx) => {
      await tx.sedes.update({
        where: { id },
        data: {
          ...(sedeData.nombre && { nombre: sedeData.nombre }),
          ...(sedeData.telefono_contacto !== undefined && {
            telefono_contacto: sedeData.telefono_contacto,
          }),
          ...(sedeData.activo !== undefined && { activo: sedeData.activo }),
          ...(sedeData.distrito && { distrito: sedeData.distrito })
        },
      });

      if (sedeData.canchas && Array.isArray(sedeData.canchas)) {
        const canchasExistentes = sedeData.canchas.filter((c) => Number.isInteger(c.id));
        const canchasNuevas = sedeData.canchas.filter((c) => !Number.isInteger(c.id));

        if (canchasExistentes.length > 0) {
          const idsEnPayload = canchasExistentes.map((c) => c.id);
          const canchasEncontradas = await tx.canchas.findMany({
            where: { sede_id: id, id: { in: idsEnPayload } },
            select: { id: true },
          });

          if (canchasEncontradas.length !== idsEnPayload.length) {
            throw new ApiError('Una o mas canchas no pertenecen a la sede seleccionada', 400);
          }
        }

        const idsAMantener = canchasExistentes.map((c) => c.id);
        const whereEliminar = {
          sede_id: id,
          ...(idsAMantener.length > 0 ? { id: { notIn: idsAMantener } } : {}),
        };

        const canchasAEliminar = await tx.canchas.findMany({
          where: whereEliminar,
          select: {
            id: true,
            nombre: true,
            _count: { select: { horarios_clases: true } },
          },
        });

        const canchasConHorarios = canchasAEliminar.filter((c) => c._count.horarios_clases > 0);
        if (canchasConHorarios.length > 0) {
          const nombres = canchasConHorarios.map((c) => `"${c.nombre}"`).join(', ');
          throw new ApiError(
            `No se pueden eliminar las canchas ${nombres} porque tienen horarios o inscripciones asociadas`,
            409,
            { cancha_ids: canchasConHorarios.map((c) => c.id) }
          );
        }

        if (canchasAEliminar.length > 0) {
          await tx.canchas.deleteMany({
            where: { id: { in: canchasAEliminar.map((c) => c.id) } },
          });
        }

        if (canchasExistentes.length > 0) {
          await Promise.all(
            canchasExistentes.map((c) =>
              tx.canchas.update({
                where: { id: c.id },
                data: { nombre: c.nombre, descripcion: c.descripcion || '' },
              })
            )
          );
        }

        if (canchasNuevas.length > 0) {
          const canchasNuevasUnicas = [];
          const nombresVistos = new Set();

          for (const cancha of canchasNuevas) {
            const nombreNormalizado = cancha.nombre.trim().toLowerCase();
            if (nombresVistos.has(nombreNormalizado)) continue;
            nombresVistos.add(nombreNormalizado);
            canchasNuevasUnicas.push({
              nombre: cancha.nombre.trim(),
              descripcion: cancha.descripcion || '',
            });
          }

          const nombresNuevos = canchasNuevasUnicas.map((c) => c.nombre);
          const yaExisten =
            nombresNuevos.length > 0
              ? await tx.canchas.findMany({
                where: {
                  sede_id: id,
                  OR: nombresNuevos.map((nombre) => ({
                    nombre: { equals: nombre, mode: 'insensitive' },
                  })),
                },
                select: { nombre: true },
              })
              : [];
          const nombresExistentes = new Set(yaExisten.map((c) => c.nombre.toLowerCase()));
          const canchasParaCrear = canchasNuevasUnicas.filter(
            (c) => !nombresExistentes.has(c.nombre.toLowerCase())
          );

          if (canchasParaCrear.length > 0) {
            await tx.canchas.createMany({
              data: canchasParaCrear.map((c) => ({
                nombre: c.nombre,
                descripcion: c.descripcion || '',
                sede_id: id,
              })),
            });
          }
        }
      }

      return await tx.sedes.findUnique({
        where: { id },
        select: SEDE_SELECT_FIELDS,
      });
    });
  },

  updateDefuseSede: async (id) => {
    return await prisma.sedes.update({
      where: { id },
      data: { activo: false },
      select: { id: true, nombre: true, activo: true, direcciones: DIRECCION_SELECT },
    });
  },

  updateActiveSede: async (id) => {
    return await prisma.sedes.update({
      where: { id },
      data: { activo: true },
      select: { id: true, nombre: true, activo: true, direcciones: DIRECCION_SELECT },
    });
  },

  deleteSede: async (id) => {
    return await prisma.$transaction(async (tx) => {
      const sede = await tx.sedes.findUnique({
        where: { id },
      });

      if (!sede) throw new ApiError('Sede no encontrada', 404);

      await tx.sedes.delete({ where: { id } });

      return { success: true, message: 'Sede y canchas eliminadas correctamente' };
    });
  },
  obtenerOcupacionDashboard: async () => {
    // 1. Traemos solo las columnas necesarias (muy optimizado)
    const sedes = await prisma.sedes.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        canchas: {
          select: {
            horarios_clases: {
              select: {
                inscripciones: {
                  where: { estado: { in: ['ACTIVO'] } },
                  select: { alumno_id: true }
                }
              }
            }
          }
        }
      }
    });

    // 2. Procesamos con la regla: 1 alumno = 1 conteo por Sede
    const resultado = sedes.map(sede => {
      const alumnosUnicos = new Set(); // El Set ignora los IDs duplicados

      sede.canchas.forEach(cancha => {
        cancha.horarios_clases.forEach(horario => {
          horario.inscripciones.forEach(insc => {
            alumnosUnicos.add(insc.alumno_id);
          });
        });
      });

      return {
        nombre: sede.nombre,
        valor: alumnosUnicos.size // El tamaño del Set es la cantidad real de alumnos
      };
    });

    // Retornamos solo las sedes que tienen al menos 1 alumno
    return resultado.filter(r => r.valor > 0);
  },
};
