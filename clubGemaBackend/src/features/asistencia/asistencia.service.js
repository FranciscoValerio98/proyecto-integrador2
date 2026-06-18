import { prisma } from '../../config/database.config.js';
import dayjs from 'dayjs';

/**
 * Función auxiliar para calcular fechas DENTRO DE UN RANGO (Dinámico) 📅
 * Garantiza que la primera clase sea IGUAL o POSTERIOR a la fecha de inicio.
 */
const calcularProximasFechas = (fechaInicio, diaSemanaClase, fechaLimite) => {
  const fechas = [];
  const fechaActual = new Date(fechaInicio);
  const diaSemanaNormalizado = diaSemanaClase === 7 ? 0 : Number(diaSemanaClase);

  if (!Number.isInteger(diaSemanaNormalizado) || diaSemanaNormalizado < 0 || diaSemanaNormalizado > 6) {
    throw new Error(`Dia de semana invalido para generar clases: ${diaSemanaClase}`);
  }

  // 🔥 CORRECCIÓN DE ZONA HORARIA (Mediodía para evitar saltos de día)
  fechaActual.setHours(12, 0, 0, 0);

  const limiteFijo = new Date(fechaLimite);
  limiteFijo.setHours(12, 0, 0, 0);

  // 1. Buscamos el primer día de clase válido que sea >= fechaInicio
  // Si la fechaInicio ya coincide con diaSemanaClase, se queda ahí.
  const diasHastaPrimeraClase = (diaSemanaNormalizado - fechaActual.getDay() + 7) % 7;
  fechaActual.setDate(fechaActual.getDate() + diasHastaPrimeraClase);

  // 2. Generamos fechas MIENTRAS no superemos el límite de los 30 días
  // Importante: Si la primera fecha encontrada ya se pasó del límite, no agrega nada.
  while (fechaActual <= limiteFijo) {
    fechas.push(new Date(fechaActual));
    fechaActual.setDate(fechaActual.getDate() + 7);
  }

  return fechas;
};

export const asistenciaService = {
  /**
   * Genera masivamente las clases futuras respetando el CICLO DE 30 DÍAS.
   * Ahora prioriza el parámetro 'fecha_inicio' para evitar solapamientos.
   */
  generarClasesFuturas: async (tx, params) => {
    // 🔥 Desestructuramos incluyendo el nuevo parámetro fecha_inicio
    const { inscripcion_id, dia_semana, usuario_admin_id, coordinador_id, fecha_inicio } = params;

    const DIAS_CICLO = 30;

    // =================================================================
    // 🧠 LÓGICA DE PUNTO DE PARTIDA (Prioridad de Negocio)
    // =================================================================
    let fechaInicioCalculo;

    if (fecha_inicio) {
      // 🌟 REGLA DE ORO: Si el pago ya definió cuándo empieza el ciclo (ej. 05/03), mandamos esa.
      fechaInicioCalculo = new Date(fecha_inicio);
      console.log(
        `🚀 Generando clases desde FECHA PROGRAMADA: ${fechaInicioCalculo.toLocaleDateString()}`
      );
    } else {
      // 🔄 FALLBACK: Lógica de empalme automática si se llama sin fecha_inicio
      const ultimaClase = await tx.registros_asistencia.findFirst({
        where: { inscripcion_id: inscripcion_id },
        orderBy: { fecha: 'desc' },
      });

      fechaInicioCalculo = new Date(); // Por defecto: HOY

      if (ultimaClase) {
        const fechaUltima = new Date(ultimaClase.fecha);
        if (fechaUltima > fechaInicioCalculo) {
          console.log(
            `📅 Detectada continuidad. Empalmando tras última clase: ${fechaUltima.toLocaleDateString()}`
          );
          fechaUltima.setDate(fechaUltima.getDate() + 1);
          fechaInicioCalculo = fechaUltima;
        }
      }
    }

    // =================================================================
    // 🧠 LÓGICA DE CÁLCULO DE LÍMITE (El "Hasta Cuándo")
    // =================================================================
    const fechaLimite = new Date(fechaInicioCalculo);
    fechaLimite.setDate(fechaLimite.getDate() + (DIAS_CICLO - 1));

    // 2. Calculamos las fechas reales de clase dentro de este ciclo
    const fechasClases = calcularProximasFechas(fechaInicioCalculo, dia_semana, fechaLimite);

    // 3. Preparamos los objetos para insertar
    const datosAsistencia = fechasClases.map((fecha) => ({
      inscripcion_id: inscripcion_id,
      fecha: fecha,
      estado: 'PROGRAMADA',
      registrado_por: coordinador_id,
    }));

    // 4. Insertamos usando skipDuplicates para blindar la base de datos
    if (datosAsistencia.length > 0) {
      await tx.registros_asistencia.createMany({
        data: datosAsistencia,
        skipDuplicates: true,
      });
    }

    console.log(
      `✅ Ciclo generado: ${datosAsistencia.length} clases para ID ${inscripcion_id} (Hasta: ${fechaLimite.toLocaleDateString()})`
    );

    return datosAsistencia.length;
  },

  obtenerHistorial: async (inscripcionId) => {
    return await prisma.registros_asistencia.findMany({
      where: { inscripcion_id: parseInt(inscripcionId) },
      orderBy: { fecha: 'asc' },
    });
  },
  obtenerPorAlumno: async (alumnoId) => {
    return await prisma.registros_asistencia.findMany({
      where: {
        inscripciones: {
          alumno_id: parseInt(alumnoId),
        },
      },
      include: {
        inscripciones: {
          include: {
            horarios_clases: {
              include: {
                canchas: { include: { sedes: true } },
                niveles_entrenamiento: true,
                usuarios: true
              },
            },
            usuarios: {
              select: {
                nombres: true,
                apellidos: true,
              },
            },
          },
        },
      },
      orderBy: { fecha: 'asc' }, // Recomendado 'asc' para ver cronológicamente
    });
  },

  /**
   * 🆕 Obtener todas las asistencias (Vista Admin)
   */
  obtenerTodas: async () => {
    return await prisma.registros_asistencia.findMany({
      include: {
        inscripciones: {
          include: {
            alumnos: {
              select: {
                usuarios: {
                  select: {
                    nombres: true,
                    apellidos: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });
  },

  obtenerClasesDelDiaPorCoordinador: async (coordinadorId, fecha) => {
    const fechaConsulta = new Date(fecha);
    fechaConsulta.setHours(0, 0, 0, 0);
    const diaSemana = fechaConsulta.getDay();

    return await prisma.horarios_clases.findMany({
      where: {
        coordinador_id: coordinadorId,
        activo: true,
        OR: [
          { dia_semana: diaSemana },
          {
            inscripciones: {
              some: {
                registros_asistencia: {
                  some: {
                    fecha: fechaConsulta,
                    reprogramacion_clase_id: { not: null }
                  }
                }
              }
            }
          }
        ]
      },
      include: {
        niveles_entrenamiento: true,
        canchas: { include: { sedes: true } },
        inscripciones: {
          where: { estado: { in: ['ACTIVO', 'PEN-RECU'] } },
          include: {
            alumnos: {
              include: {
                usuarios: {
                  select: { id: true, nombres: true, apellidos: true },
                },
              },
            },
            // IMPORTANTE: Buscamos el registro de asistencia específico para este día
            registros_asistencia: {
              where: { fecha: fechaConsulta },
              select: {
                id: true, // Este es el ID que usará el coordinador para marcar
                estado: true, // Saldrá "PROGRAMADA" inicialmente
                comentario: true,
                reprogramaciones_clases: {
                  select: {
                    hora_inicio_destino: true,
                    hora_fin_destino: true
                  }
                },
              },
            },
          },
        },
      },
      orderBy: { hora_inicio: 'asc' },
    });
  },
  // En asistencia.service.js
  obtenerAgendaCoordinador: async (coordinadorId, fecha = null) => {
    const whereCondition = {
      coordinador_id: coordinadorId,
      activo: true,
    };

    if (fecha) {
      const fechaConsulta = new Date(fecha);
      fechaConsulta.setHours(0, 0, 0, 0);
      const diaSemana = fechaConsulta.getDay();

      whereCondition.OR = [
        { dia_semana: diaSemana },
        {
          inscripciones: {
            some: {
              registros_asistencia: {
                some: {
                  fecha: fechaConsulta,
                }
              }
            }
          }
        }
      ];
    }

    const horarios = await prisma.horarios_clases.findMany({
      where: whereCondition,
      include: {
        niveles_entrenamiento: true,
        canchas: { include: { sedes: true } },
        inscripciones: {
          where: { estado: { in: ['ACTIVO', 'FINALIZADO'] } },
          include: {
            usuarios: {
              select: { id: true, nombres: true, apellidos: true, numero_documento: true, fecha_nacimiento: true },
            },
            registros_asistencia: {
              where: fecha
                ? {
                  OR: [
                    { fecha: new Date(fecha) },
                  ],
                  estado: { not: 'SIN_REGISTRO' },
                }
                : { estado: { not: 'SIN_REGISTRO' }, },
              orderBy: { fecha: 'asc' },
              select: {
                id: true,
                fecha: true,
                estado: true,
              },
            },
          },
        },
      },
      orderBy: { hora_inicio: 'asc' },
    });

    return horarios.map((h) => {

      const formatTime = (timeField) => {
        if (!timeField) return '--:--';
        const d = new Date(timeField);
        const horas = d.getUTCHours().toString().padStart(2, '0');
        const minutos = d.getUTCMinutes().toString().padStart(2, '0');
        return `${horas}:${minutos}`;
      };

      return {
        ...h,
        hora_inicio: formatTime(h.hora_inicio),
        hora_fin: formatTime(h.hora_fin),
      };
    });
  },
  previsualizarfechasFuturas: async (data) => {
    const { alumno_id, horario_ids } = data;

    try {
      const hoy = dayjs().startOf('day');
      let resultados = [];

      // 1. Buscamos los detalles de los horarios solicitados
      const horarios = await prisma.horarios_clases.findMany({
        where: { id: { in: horario_ids } }
      });

      for (const horario of horarios) {
        let fechasEsteDia = [];

        // 🚩 AJUSTE CRÍTICO PARA FORMATO 1-7: Dayjs necesita 0-6
        const diaMapeado = horario.dia_semana === 7 ? 0 : horario.dia_semana;
        let fechaBase = hoy.day(diaMapeado);

        // Si ya pasó en la semana actual, saltamos a la próxima
        if (fechaBase.isBefore(hoy, 'day')) {
          fechaBase = fechaBase.add(7, 'day');
        }

        // 🕵️‍♂️ LÓGICA INTELIGENTE: Buscar la última clase de ESTE alumno en ESTE horario
        const ultimaClase = await prisma.registros_asistencia.findFirst({
          where: {
            inscripciones: {
              alumno_id: Number(alumno_id),
              horario_id: horario.id
            }
          },
          orderBy: { fecha: 'desc' }
        });

        // 🛡️ REGLA DE ENGANCHE (Vacunada contra Timezones)
        if (ultimaClase) {
          // ✅ FIX: Extraemos solo el "YYYY-MM-DD" en UTC puro antes de que Node/Dayjs lo conviertan a hora local y le resten 5 horas
          const fechaStringPura = ultimaClase.fecha.toISOString().split('T')[0];
          const fechaUltima = dayjs(fechaStringPura).startOf('day');

          // Si su última clase es hoy, mañana o en el futuro, enganchamos 7 días después
          if (fechaUltima.isAfter(hoy.subtract(1, 'day'))) {
            fechaBase = fechaUltima.add(7, 'day');
          }
        }

        // Opción A: Inicio Inmediato (o fecha de enganche segura)
        fechasEsteDia.push(fechaBase.format('YYYY-MM-DD'));

        // Opción B: Próximo Turno (+7 días sobre la base calculada)
        fechasEsteDia.push(fechaBase.add(7, 'day').format('YYYY-MM-DD'));

        resultados.push(fechasEsteDia);
      }

      return resultados;
    } catch (error) {
      console.error("Error en previsualizarfechasFuturas:", error);
      throw error;
    }
  },

  procesarAsistenciaMasiva: async (asistencias) => {

    const esFechaFutura = (fechaClase) => {
      const hoy = new Date();
      const hoyUTC = Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate());

      const fecha = new Date(fechaClase);
      const fechaUTC = Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate());

      return fechaUTC > hoyUTC;
    };

    return await prisma.$transaction(async (tx) => {
      for (const a of asistencias) {

        // Si el estado de la asistencia es JUSTIFICADO_LESION, se salta al siguiente alumno.
        const asistencia = await tx.registros_asistencia.findUnique({
          where: { id: Number(a.id) },
        });

        if (esFechaFutura(asistencia.fecha)) {
          throw new Error("No se puede registrar asistencia en una fecha futura.");
        }

        const asistenciaRegistrada = await tx.registros_asistencia.update({
          where: { id: Number(a.id) },
          data: {
            estado: a.estado,
            registrado_en: new Date(),
          },
          include: {
            inscripciones: true,
          },
        });
      }
    });
  },
  obtenerEstadisticasAlumno: async (alumnoId) => {
    // 1. Traemos TODOS los registros del alumno
    const registros = await prisma.registros_asistencia.findMany({
      where: {
        inscripciones: {
          alumno_id: parseInt(alumnoId),
        }
      }
    });

    // 2. Inicializamos los contadores
    let presente = 0;
    let falta = 0;
    let programada = 0;
    let justificado_lesion = 0;

    // 3. Clasificamos cada clase según tu regla de negocio
    registros.forEach(reg => {
      // Agrupamos también las recuperaciones completadas para ser justos
      if (reg.estado === 'PRESENTE' || reg.estado === 'COMPLETADA_PRESENTE') {
        presente++;
      } else if (reg.estado === 'FALTA' || reg.estado === 'COMPLETADA_FALTA') {
        falta++;
      } else if (reg.estado === 'PROGRAMADA') {
        programada++;
      } else if (reg.estado === 'JUSTIFICADO_LESION') {
        justificado_lesion++;
      }
    });

    // 4. EL NÚCLEO DE LA EVALUACIÓN (Solo Presentes y Faltas)
    const clasesEvaluables = presente + falta;

    // 5. Matemáticas de porcentajes (evitando dividir por cero)
    const porcentajePresente = clasesEvaluables > 0 ? Math.round((presente / clasesEvaluables) * 100) : 0;
    const porcentajeFalta = clasesEvaluables > 0 ? Math.round((falta / clasesEvaluables) * 100) : 0;

    // 6. Armamos la respuesta perfecta para el Frontend
    return {
      porcentaje_asistencia_real: porcentajePresente, // El dato principal
      totales: {
        evaluadas: clasesEvaluables,
        ignoradas: programada + justificado_lesion,
        historico_completo: registros.length
      },
      detalle: {
        PRESENTE: {
          cantidad: presente,
          porcentaje: porcentajePresente
        },
        FALTA: {
          cantidad: falta,
          porcentaje: porcentajeFalta
        },
        PROGRAMADA: {
          cantidad: programada,
          porcentaje: null // Se ignora en el cálculo
        },
        JUSTIFICADO_LESION: {
          cantidad: justificado_lesion,
          porcentaje: null // Se ignora en el cálculo
        }
      }
    };
  },

  eliminarClases: async (tx, inscripcionId, fecha_inscripcion) => {
    const registros = await tx.registros_asistencia.deleteMany({
      where: {
        inscripcion_id: inscripcionId,
        fecha: {
          gte: fecha_inscripcion,
        }
      }
    })
    return registros.count;
  }
};
