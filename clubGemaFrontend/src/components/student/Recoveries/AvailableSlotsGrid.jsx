import React from 'react';
import { Clock, MapPin, User, Star, CalendarPlus, Search } from 'lucide-react';

const AvailableSlotsGrid = ({ slots, onSlotClick, loading }) => {
    const diasSemana = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];
    const mesesCompletos = [
        "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
        "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-black uppercase text-xs tracking-widest italic">Buscando horarios...</p>
        </div>
    );

    if (!slots || slots.length === 0) return (
        <div className="text-center py-16 px-6 bg-white border-2 border-dashed border-slate-200 rounded-[2rem]">
            <Search size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 font-bold italic">No hay horarios disponibles para los filtros seleccionados.</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {slots.map((slot) => {
                const horario = slot.horarioData;
                const fechaObj = new Date(slot.fecha);
                const coordinatorName = horario.coordinador?.nombre_completo || "Coach Gema";

                // Formateamos ambas horas: inicio y fin
                const horaInicio = horario.hora_inicio.substring(0, 5);
                const horaFin = horario.hora_fin ? horario.hora_fin.substring(0, 5) : null;

                return (
                    <button
                        key={slot.id}
                        onClick={() => onSlotClick(slot)}
                        className="group relative bg-white border-2 border-slate-100 hover:border-orange-500 rounded-[2rem] p-6 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/10"
                    >
                        {/* Header Tarjeta */}
                        <div className="flex items-start justify-between mb-5">
                            <div className="flex items-center gap-4">
                                {/* 🗓️ Bloque de Día Numérico */}
                                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-[#1e3a8a] text-white font-black shadow-lg shadow-blue-900/20 group-hover:bg-orange-500 group-hover:shadow-orange-500/30 transition-colors shrink-0">
                                    <span className="text-2xl leading-none italic font-black">
                                        {fechaObj.getDate()}
                                    </span>
                                </div>

                                {/* 📅 Texto de Fecha y Rango de Horas */}
                                <div className="min-w-0">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter leading-none">
                                            {diasSemana[fechaObj.getDay()]}
                                        </span>
                                        <span className="text-sm text-[#1e3a8a] font-black uppercase tracking-tighter italic leading-tight">
                                            {mesesCompletos[fechaObj.getMonth()]}
                                        </span>
                                    </div>

                                    {/* 🕒 Muestra el rango: 00:00 - 00:00 */}
                                    <div className="flex items-center gap-1.5 mt-1 text-slate-700 font-black text-xs uppercase tracking-tighter bg-slate-50 group-hover:bg-orange-50 px-2 py-0.5 rounded-lg w-fit transition-colors">
                                        <Clock size={12} className="text-orange-500" />
                                        {horaInicio} {horaFin && `— ${horaFin}`}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-2.5 rounded-xl text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-all shrink-0">
                                <CalendarPlus size={22} />
                            </div>
                        </div>

                        {/* Detalles Inferiores */}
                        <div className="space-y-3 border-t border-slate-50 pt-4">
                            <div className="flex items-center gap-3 text-slate-600">
                                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <MapPin size={14} />
                                </div>
                                <span className="uppercase font-black text-[10px] tracking-[0.05em] italic truncate">
                                    {horario.canchas?.nombre || horario.cancha?.nombre}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 text-slate-600">
                                <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                                    <Star size={14} fill="currentColor" />
                                </div>
                                <span className="uppercase font-black text-[10px] tracking-[0.05em] italic">
                                    {horario.niveles_entrenamiento?.nombre || horario.nivel?.nombre}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 text-slate-600">
                                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                    <User size={14} />
                                </div>
                                <span className="uppercase font-black text-[10px] tracking-[0.05em] italic truncate">
                                    {coordinatorName}
                                </span>
                            </div>
                        </div>

                        {/* Badge de Disponibilidad */}
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[9px] text-emerald-600 font-black uppercase tracking-widest">Cupo Disponible</span>
                            </div>

                            {/* Botón flotante simulado para mejorar el feedback visual */}
                            <span className="text-[9px] font-black uppercase text-orange-500 tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                AGENDAR →
                            </span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

export default AvailableSlotsGrid;