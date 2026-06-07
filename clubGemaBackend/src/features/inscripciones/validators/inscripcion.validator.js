/**
 * Verifica si el alumno tiene deudas que bloqueen el proceso.
 */
export const validarMuroDeDeuda = async (tx, alumnoId) => {
  const deudasPendientes = await tx.cuentas_por_cobrar.count({
    where: {
      alumno_id: Number.parseInt(alumnoId),
      estado: { in: ['PENDIENTE', 'PARCIAL','POR_VALIDAR'] },
    },
  });

  if (deudasPendientes > 0) {
    throw new Error(
      '⛔ BLOQUEO: Tienes pagos pendientes o en revisión. Por favor, regulariza tu saldo o espera a que validemos tu último pago para inscribirte nuevamente.'
    );
  }
};

/**
 * Valida si un horario específico tiene cupos disponibles considerando inscripciones activas y temporales.
 */
export const validarAforoHorario = async (tx, idHorario, fechaLimiteZombie) => {
  const horario = await tx.horarios_clases.findUnique({ where: { id: idHorario } });
  if (!horario) throw new Error(`El horario ID ${idHorario} no existe.`);

  const ocupados = await tx.inscripciones.count({
    where: {
      horario_id: idHorario,
      OR: [
        { estado: 'ACTIVO' },
        { estado: 'POR_VALIDAR' },
        { estado: 'VENCIDO' },
        {
          AND: [
            { estado: 'PENDIENTE_PAGO' },
            { fecha_inscripcion: { gt: fechaLimiteZombie } },
          ],
        },
      ],
    },
  });

  if (ocupados >= (horario.capacidad_max || 20)) {
    throw new Error(`El horario del día ${horario.dia_semana} ya está AGOTADO.`);
  }

  return horario;
};
/**
 * Verifica si ya existe una deuda de renovación generada recientemente.
 */
export const existeRenovacionReciente = async (tx, alumnoId, inicioBusqueda) => {
  const deuda = await tx.cuentas_por_cobrar.findFirst({
    where: {
      alumno_id: alumnoId,
      estado: 'PENDIENTE',
      detalle_adicional: { contains: 'Renovación Automática' },
      creado_en: { gte: inicioBusqueda },
    },
  });
  return !!deuda;
};

// =================================================================
// 🔥 NUEVO FILTRO 6: EL MURO DE RECUPERACIONES
// =================================================================
/**
 * Verifica si el alumno tiene recuperaciones pendientes o programadas.
 */
export const validarSinRecuperacionesPendientes = async (tx, alumnoId) => {
  const recuperacionesPendientes = await tx.recuperaciones.count({
    where: {
      alumno_id: Number.parseInt(alumnoId),
      estado: { in: ['PENDIENTE', 'PROGRAMADA'] },
    },
  });

  if (recuperacionesPendientes > 0) {
    throw new Error(
      '⛔ BLOQUEO POR RECUPERACIÓN: Tienes clases por recuperar. Debes agendar y asistir a tus clases pendientes antes de comprar un nuevo paquete.'
    );
  }
};