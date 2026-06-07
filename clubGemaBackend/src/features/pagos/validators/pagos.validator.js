/**
 * Valida que la deuda exista y sea apta para recibir pagos.
 */
export const validarDeudaParaPago = async (tx, deudaId) => {
  const deuda = await tx.cuentas_por_cobrar.findUnique({
    where: { id: Number.parseInt(deudaId) },
  });

  if (!deuda) throw new Error('La deuda indicada no existe.');
  if (deuda.estado === 'PAGADA') throw new Error('Esta deuda ya fue pagada completamente.');

  return deuda;
};
/**
 * Busca un pago, verifica que esté pendiente de validación,
 * y BLOQUEA AL ADMIN si hay recuperaciones pendientes.
 */
export const buscarYValidarPagoPendiente = async (tx, pagoId) => {
  const pago = await tx.pagos.findUnique({
    where: { id: Number.parseInt(pagoId) },
    include: { cuentas_por_cobrar: true },
  });

  if (!pago) throw new Error('El pago ID indicado no existe.');
  if (pago.estado_validacion !== 'PENDIENTE') {
    throw new Error('Este pago ya fue validado anteriormente.');
  }

  // =================================================================
  // 🔥 EL MURO PARA EL ADMIN: "NO LO APRUEBES TODAVÍA"
  // =================================================================
  const recuperacionesPendientes = await tx.recuperaciones.count({
    where: {
      alumno_id: pago.cuentas_por_cobrar.alumno_id,
      estado: { in: ['PENDIENTE', 'PROGRAMADA'] },
    },
  });

  if (recuperacionesPendientes > 0) {
    throw new Error(
      '⛔ VALIDACIÓN BLOQUEADA: El alumno tiene clases por recuperar. No puedes aprobar su mensualidad ni generarle nuevas clases hasta que asista a sus recuperaciones.'
    );
  }

  return pago;
};


