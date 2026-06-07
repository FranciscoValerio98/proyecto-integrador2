export const generarClasesDisponibles = (horariosPatron, semanasAVer = 2) => {
    const clasesGeneradas = [];
    const hoy = new Date();

    // Generamos clases para los próximos X días (semanasAVer * 7)
    for (let i = 0; i <= semanasAVer * 7; i++) {
        const fechaActual = new Date();
        fechaActual.setDate(hoy.getDate() + i); // Empezamos desde hoy
        let diaSemanaActual = fechaActual.getDay();
        diaSemanaActual = diaSemanaActual === 0 ? 7 : diaSemanaActual;

        // Filtramos los horarios que coinciden con este día de la semana
        const horariosDelDia = horariosPatron.filter(h => h.dia_semana === diaSemanaActual && h.activo);

        horariosDelDia.forEach(horario => {
            // Creamos una fecha local limpia
            const año = fechaActual.getFullYear();
            const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
            const dia = String(fechaActual.getDate()).padStart(2, '0');

            // Formato YYYY-MM-DD (Esto es indestructible, no tiene zona horaria)
            const fechaPlana = `${año}-${mes}-${dia}`;

            const [h, m] = horario.hora_inicio.split(':');
            const fechaClase = new Date(
                fechaActual.getFullYear(),
                fechaActual.getMonth(),
                fechaActual.getDate(),
                parseInt(h),
                parseInt(m)
            );

            if (fechaClase > hoy) {
                clasesGeneradas.push({
                    id: `slot-${horario.id}-${fechaActual.getTime()}`,
                    fecha: `${fechaPlana}T${horario.hora_inicio}`,
                    horarioData: horario
                });
            }
        });
    }

    // Ordenar por fecha
    return clasesGeneradas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
};