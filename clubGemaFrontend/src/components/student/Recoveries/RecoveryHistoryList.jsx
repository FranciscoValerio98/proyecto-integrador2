import React from 'react';
import { CalendarX2, CheckCircle, Clock, AlertTriangle, XCircle, MapPin, Trash2, Info } from 'lucide-react';

const RecoveryHistoryList = ({ historial, onCancel }) => {
    const formatTime = (timeString) => {
        if (!timeString) return '';
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
    };

    const canCancel = (fechaProgramada, horaInicio) => {
        if (!fechaProgramada || !horaInicio) return false;
        const ahora = new Date();
        const fechaProg = new Date(fechaProgramada);
        const hora = new Date(horaInicio);
        const fechaClase = new Date(Date.UTC(
            fechaProg.getUTCFullYear(),
            fechaProg.getUTCMonth(),
            fechaProg.getUTCDate(),
            hora.getUTCHours() + 5,
            hora.getUTCMinutes(),
            0,
            0
        ));

        const diffMilisegundos = fechaClase.getTime() - ahora.getTime();
        const horasFaltantes = diffMilisegundos / (1000 * 60 * 60);
        return horasFaltantes >= 1;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PROGRAMADA': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-500/30 flex items-center gap-1"><Clock size={12} /> Programada</span>;
            case 'COMPLETADA_PRESENTE': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-500/30 flex items-center gap-1"><CheckCircle size={12} /> Asistió</span>;
            case 'COMPLETADA_FALTA': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-500/30 flex items-center gap-1"><XCircle size={12} /> Faltó</span>;
            case 'VENCIDA': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-600 border border-gray-400/30 flex items-center gap-1"><CalendarX2 size={12} /> Vencida</span>;
            case 'CANCELADA': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-500/30 flex items-center gap-1"><AlertTriangle size={12} /> Cancelada</span>;
            default: return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-500/30 flex items-center gap-1"><Clock size={12} /> {status}</span>;
        }
    };

    return (
        <div className="flex flex-col gap-6">

            {/* 🔥 NUEVO: Banner Informativo de Reglas */}
            <div className="bg-blue-50 border border-blue-200 rounded-3xl p-5 flex gap-4 text-blue-800 shadow-sm">
                <Info className="shrink-0 text-blue-600 mt-0.5" size={24} />
                <div className="text-sm">
                    <h4 className="font-extrabold text-blue-900 mb-2 uppercase tracking-wide text-xs">Información Importante</h4>
                    <ul className="list-disc list-inside space-y-1.5 text-blue-700/80 font-medium">
                        <li>Las clases <strong className="text-blue-900">Programadas</strong> pueden cancelarse con al menos <strong className="text-blue-900">1 hora de anticipación</strong>.</li>
                        <li>Si cancelas a tiempo, el ticket volverá automáticamente a tu lista de "Pendientes".</li>
                        <li>Si faltas a una clase de recuperación programada, el ticket se perderá definitivamente.</li>
                    </ul>
                </div>
            </div>
            {/* Manejo de estado vacío */}
            {(!historial || historial.length === 0) ? (
                <div className="p-6 rounded-3xl border border-dashed border-gray-300 text-center text-gray-500 shadow-sm bg-white">
                    Aún no tienes un historial de recuperaciones.
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {historial.map((ticket) => {
                        const isProgramada = ticket.estado === 'PROGRAMADA';
                        const isCancelable = isProgramada && canCancel(ticket.fecha_programada, ticket.horarios_clases?.hora_inicio);

                        return (
                            <div key={ticket.id} className="group bg-white border border-gray-200 rounded-3xl p-6 flex flex-col shadow-xl md:flex-row justify-between items-start md:items-center gap-4 hover:border-[#1e3a8a] hover:bg-[#1e3a8a] transition-all duration-300">
                                {/* Lado Izquierdo: Info */}
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        {getStatusBadge(ticket.estado)}
                                        <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors font-medium">
                                            Fecha de falta: {new Date(ticket.fecha_falta).toLocaleDateString('es-ES', { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' })}
                                        </span>
                                        {ticket.es_por_lesion && (
                                            <span className="text-[10px] bg-orange-100 text-orange-600 border border-orange-200 px-2 py-0.5 rounded uppercase font-black">
                                                Justificado Méd.
                                            </span>
                                        )}
                                    </div>

                                    {/* Info de la clase agendada */}
                                    {ticket.fecha_programada && ticket.horarios_clases ? (
                                        <div className="mt-2">
                                            <p className="text-slate-800 font-bold group-hover:text-white transition-colors text-lg">
                                                {new Date(ticket.fecha_programada).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                                            </p>
                                            <div className="flex items-center gap-4 mt-1">
                                                <p className="text-sm font-medium text-slate-500 group-hover:text-blue-200 flex items-center gap-1">
                                                    <Clock size={14} /> {formatTime(ticket.horarios_clases.hora_inicio)} - {formatTime(ticket.horarios_clases.hora_fin)}
                                                </p>
                                                <p className="text-sm font-medium text-slate-500 group-hover:text-blue-200 flex items-center gap-1">
                                                    <MapPin size={14} /> {ticket.horarios_clases.canchas?.sedes?.nombre} (Cancha {ticket.horarios_clases.canchas?.numero})
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-slate-600 font-medium group-hover:text-white transition-colors mt-2">
                                            {ticket.estado === 'VENCIDA' ? 'El tiempo para recuperar esta clase ha expirado.' : 'No se agendó ninguna clase.'}
                                        </p>
                                    )}
                                </div>

                                {/* Lado Derecho: Acciones (Solo visible si está PROGRAMADA) */}
                                {isProgramada && (
                                    <div className="shrink-0 flex flex-col items-end gap-2">
                                        {isCancelable ? (
                                            <button
                                                onClick={() => onCancel(ticket.id)}
                                                className="flex items-center gap-2 text-sm font-bold text-red-600 hover:text-white hover:bg-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-200 hover:border-red-500 transition-all shadow-sm"
                                            >
                                                <Trash2 size={16} /> Cancelar Reserva
                                            </button>
                                        ) : (
                                            <div className="bg-gray-100 group-hover:bg-white/10 px-4 py-3 rounded-xl border border-gray-200 group-hover:border-white/20 transition-colors">
                                                <p className="text-xs font-bold text-gray-500 group-hover:text-gray-300">Ya no puedes cancelar</p>
                                                <p className="text-[10px] text-gray-400 group-hover:text-gray-400 mt-0.5">Falta menos de 1 hora</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RecoveryHistoryList;