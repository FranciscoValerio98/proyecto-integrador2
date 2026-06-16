import { prisma } from '../../../config/database.config.js';

export const reporteService = {
  async getDetailedExcelReport() {
    try {
      // Obtenemos todos los alumnos para asegurar los 518+ registros
      const todosLosAlumnos = await prisma.usuarios.findMany({
        where: { roles: { nombre: 'Alumno' } },
        include: {
          inscripciones: {
            include: {
              horarios_clases: {
                include: {
                  niveles_entrenamiento: true,
                  canchas: { include: { sedes: true } }
                }
              },
              inscripciones_deudas_link: {
                select: {
                  cuentas_por_cobrar: true,
                },
                orderBy: { cuenta_id: 'desc' },
                take: 1
              }
            },
            orderBy: { fecha_inscripcion: 'desc' }
          }
        },
      });

      if (!todosLosAlumnos || todosLosAlumnos.length === 0) return [];

      const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

      return todosLosAlumnos.map((alumno) => {
        const usu = alumno;
        const ultimaCuota = alumno?.inscripciones?.[0]?.inscripciones_deudas_link?.[0]?.cuentas_por_cobrar;

        // --- LÓGICA DE VIGENCIA REAL ---
        // Un alumno es vigente si tiene al menos una inscripción 'ACTIVO'
        const tieneInscripcionActiva = alumno.inscripciones?.some(
          (ins) => ins.estado === 'ACTIVO'
        );

        const fechaCorte = ultimaCuota?.fecha_vencimiento
          ? new Date(ultimaCuota.fecha_vencimiento).toLocaleDateString('es-PE')
          : 'Sin Fecha';

        const apellidosArray = (usu?.apellidos || '').trim().split(' ');
        const apePaterno = apellidosArray[0] || '';
        const apeMaterno = apellidosArray.slice(1).join(' ') || '';

        // --- RECOLECCIÓN DE DATOS DE SEDE/HORARIO ---
        const sedesUnicas = new Set();
        const nivelesUnicos = new Set();
        const diasUnicos = new Set();

        // Solo mostramos sedes/horarios si la inscripción está activa o pendiente
        // (Para que los antiguos no salgan con sedes de hace meses si ya no asisten)
        alumno.inscripciones?.forEach(ins => {
          if (ins.estado === 'ACTIVO' || ins.estado === 'PENDIENTE_PAGO') {
            const hor = ins.horarios_clases;
            if (hor) {
              if (hor.canchas?.sedes?.nombre) sedesUnicas.add(hor.canchas.sedes.nombre);
              if (hor.niveles_entrenamiento?.nombre) nivelesUnicos.add(hor.niveles_entrenamiento.nombre);
              if (hor.dia_semana !== undefined) diasUnicos.add(diasSemana[hor.dia_semana]);
            }
          }
        });

        return {
          'Sede': sedesUnicas.size > 0 ? Array.from(sedesUnicas).join(', ') : 'N/A',
          'Nivel': nivelesUnicos.size > 0 ? Array.from(nivelesUnicos).join(', ') : 'N/A',
          'Modalidad': diasUnicos.size > 0 ? Array.from(diasUnicos).join(', ') : 'N/A',
          'Nombres': usu?.nombres || 'N/A',
          'Apellido Paterno': apePaterno,
          'Apellido Materno': apeMaterno,
          'Nro Celular': usu?.telefono_personal || 'N/A',
          'Fecha de Nacimiento': usu?.fecha_nacimiento
            ? new Date(usu.fecha_nacimiento).toLocaleDateString('es-PE')
            : 'N/A',
          'Alumno Vigente': tieneInscripcionActiva ? 'Si' : 'No', // <--- CAMBIO AQUÍ
          'Fecha de corte o fin de mensualidad': fechaCorte
        };
      });

    } catch (error) {
      console.error('Error en reporteService:', error);
      return [];
    }
  },
};