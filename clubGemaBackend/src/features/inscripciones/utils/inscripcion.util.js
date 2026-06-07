// 🔥 IMPORTAMOS DAYJS Y CONFIGURAMOS LIMA 🔥
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);
const TZ_LIMA = 'America/Lima';

/**
 * Cuenta cuántas veces cae un día específico de la semana entre dos fechas.
 * @param {number} diaSemana - Día buscado (0-6, donde 0 es domingo o según configuración).
 * @param {Date} inicio - Fecha inicial.
 * @param {Date} fin - Fecha final.
 * @returns {number} Cantidad de ocurrencias.
 */
export const contarClasesEnIntervalo = (diaSemana, inicio, fin) => {
  let contador = 0;

  const diaCorregido = diaSemana === 7 ? 0 : diaSemana;
  // 🔥 CAMBIO CON DAYJS: Anclamos el inicio a las 12:00 PM hora Lima
  let puntero = dayjs(inicio).tz(TZ_LIMA).hour(12).minute(0).second(0).millisecond(0);
  
  // 🔥 CAMBIO CON DAYJS: Anclamos el fin al último milisegundo del día en hora Lima
  let finFijo = dayjs(fin).tz(TZ_LIMA).endOf('day');

  // 🔥 CAMBIO CON DAYJS: Evaluamos usando isBefore e isSame de dayjs
  while (puntero.isBefore(finFijo) || puntero.isSame(finFijo, 'day')) {
    if (puntero.day() === diaCorregido) contador++;
    puntero = puntero.add(1, 'day'); // 🔥 Sumamos 1 día de forma segura
  }
  return contador;
};

/**
 * Valida que el input de horarios sea correcto.
 */
export const validarInputInscripcion = (horario_ids) => {
  if (!horario_ids || !Array.isArray(horario_ids) || horario_ids.length === 0) {
    throw new Error('Debes seleccionar al menos un horario.');
  }
};

/**
 * Calcula el rango de búsqueda para las inscripciones que deben renovarse.
 * @param {number} diasAnticipacion - Días antes del vencimiento para generar la deuda.
 */
export const calcularRangoRenovacion = (diasAnticipacion) => {
  const diasCiclo = 30;
  const diasAtras = diasCiclo - diasAnticipacion;

  // 🔥 CAMBIO CON DAYJS: Buscamos "hoy" en Lima, restamos los días, y vamos al inicio del día (00:00:00)
  const inicioLima = dayjs().tz(TZ_LIMA).subtract(diasAtras, 'day').startOf('day');
  
  // 🔥 CAMBIO CON DAYJS: El final del rango es exactamente al terminar ese día (23:59:59)
  const finLima = inicioLima.endOf('day');

  // 🔥 CAMBIO CON DAYJS: Convertimos a Date nativo con .toDate() para Prisma
  return { 
    inicio: inicioLima.toDate(), 
    fin: finLima.toDate() 
  };
};

/**
 * Calcula la fecha de vencimiento para la nueva deuda de renovación.
 */
export const calcularFechaVencimiento = (diasAnticipacion) => {
  // 🔥 CAMBIO CON DAYJS: Sumamos los días de anticipación y mandamos la hora al FINAL del día (23:59:59) de Lima
  return dayjs().tz(TZ_LIMA).add(diasAnticipacion, 'day').endOf('day').toDate();
};