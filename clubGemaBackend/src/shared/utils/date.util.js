/**
 * Formatea una fecha a string en español (DD/MM/YYYY).
 * @param {Date} date - Objeto Date a formatear.
 * @returns {string} Fecha formateada.
 */
export const formatFechaEs = (date) => {
  if (!date || Number.isNaN(new Date(date).getTime())) return 'N/A';
  const d = new Date(date);
  const day = d.getUTCDate().toString().padStart(2, '0');
  const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
};
