import React, { useState, useEffect, useMemo } from 'react';
import { CalendarDays, Loader2, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../interceptors/api';
import { API_ROUTES } from '../../constants/apiRoutes';

const MonthlyCalendarDashboard = () => {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clasesProgramadas, setClasesProgramadas] = useState([]);
  const [fechaReferencia, setFechaReferencia] = useState(new Date());

  useEffect(() => {
    const fetchAsistenciasAlumno = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const res = await apiFetch.get(API_ROUTES.ASISTENCIAS.ALUMNO_HISTORIAL(userId));
        const result = await res.json();
        if (res.ok && result.data) setClasesProgramadas(result.data);
      } catch (error) { console.error("Error al cargar agenda:", error); } 
      finally { setLoading(false); }
    };
    fetchAsistenciasAlumno();
  }, [userId]);

  const { diasCalendario, mesActual, anioActual } = useMemo(() => {
    const year = fechaReferencia.getFullYear();
    const month = fechaReferencia.getMonth();
    const primerDiaMes = new Date(year, month, 1);
    let startOffset = primerDiaMes.getDay() === 0 ? 6 : primerDiaMes.getDay() - 1;
    const dias = [];
    const fechaInicio = new Date(primerDiaMes);
    fechaInicio.setDate(fechaInicio.getDate() - startOffset);
    for (let i = 0; i < 42; i++) {
      dias.push(new Date(fechaInicio));
      fechaInicio.setDate(fechaInicio.getDate() + 1);
    }
    return { diasCalendario: dias, mesActual: month, anioActual: year };
  }, [fechaReferencia]);

  const esHoy = (date) => new Date().toDateString() === date.toDateString();
  const esMismoMes = (date) => date.getMonth() === mesActual;

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    const match = timeStr.match(/(\d{2}:\d{2})/);
    return match ? match[1] : timeStr.slice(0, 5);
  };

  const getEstadoInfo = (sesion) => {
    const estadoLimpio = sesion.estado?.toUpperCase();
    const esPresente = estadoLimpio === 'PRESENTE' || estadoLimpio === 'COMPLETADA_PRESENTE';
    const esFalta = estadoLimpio === 'FALTA' || estadoLimpio === 'COMPLETADA_FALTA';
    const esReprogramado = estadoLimpio === 'REPROGRAMADO';

    if (esPresente) return { color: 'border-emerald-500 bg-emerald-50 text-emerald-700' };
    if (esFalta) return { color: 'border-rose-500 bg-rose-50 text-rose-700' };
    if (esReprogramado) return { color: 'border-slate-300 bg-slate-100 text-slate-400 opacity-60' };
    return { color: 'border-orange-500 bg-white text-[#1e3a8a]' };
  };

  const getClasesDia = (fechaCalendario) => {
    const target = `${fechaCalendario.getFullYear()}-${String(fechaCalendario.getMonth() + 1).padStart(2, '0')}-${String(fechaCalendario.getDate()).padStart(2, '0')}`;
    return clasesProgramadas.filter(reg => {
      if (!reg.fecha) return false;
      const fechaDB = reg.fecha.includes('T') ? reg.fecha.split('T')[0] : reg.fecha;
      return fechaDB === target;
    });
  };

  if (loading) return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm flex justify-center items-center h-40 border border-slate-100">
      <Loader2 className="animate-spin text-orange-500" size={28} />
    </div>
  );

  return (
    <section className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-3 md:p-6 shadow-xl border border-slate-100 flex flex-col overflow-hidden">
      {/* HEADER COMPACTO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
        <div>
          <h2 className="flex items-center gap-1.5 text-sm md:text-lg font-black italic uppercase tracking-widest text-orange-500">
            <CalendarDays className="w-4 h-4" /> GEMA PLANNER
          </h2>
          <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 italic">
            Mes de {new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date(anioActual, mesActual))} {anioActual}
          </p>
        </div>

        <div className="flex items-center justify-between md:justify-center w-full md:w-auto bg-slate-50 p-1 rounded-xl border border-slate-100">
          <button onClick={() => setFechaReferencia(new Date(anioActual, mesActual - 1))} className="p-2 md:p-1.5 hover:bg-white rounded-lg transition-all shadow-sm bg-white md:bg-transparent"><ChevronLeft size={16} /></button>
          <span className="text-[10px] font-black px-2 text-[#1e3a8a] text-center italic uppercase truncate">
            {new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(new Date(anioActual, mesActual))}
          </span>
          <button onClick={() => setFechaReferencia(new Date(anioActual, mesActual + 1))} className="p-2 md:p-1.5 hover:bg-white rounded-lg transition-all shadow-sm bg-white md:bg-transparent"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* GRID CALENDARIO */}
      <div className="border border-slate-200 rounded-xl md:rounded-2xl bg-white overflow-hidden shadow-sm">
        {/* DÍAS SEMANA */}
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
            <div key={i} className="py-2 text-center text-[9px] md:text-[10px] font-black text-[#1e3a8a] italic tracking-wider">{d}</div>
          ))}
        </div>

        {/* CELDAS */}
        <div className="grid grid-cols-7 grid-rows-6">
          {diasCalendario.map((dia, idx) => {
            const clases = getClasesDia(dia);
            const hoy = esHoy(dia);
            const mismoMes = esMismoMes(dia);

            return (
              <div key={idx} className={`min-h-[70px] md:min-h-[100px] border-r border-b border-slate-100 p-0.5 md:p-1 transition-colors ${!mismoMes ? 'bg-slate-50/50 opacity-40' : 'bg-white'}`}>
                {/* NÚMERO DÍA */}
                <div className="flex justify-end mb-0.5 md:mb-1">
                  <span className={`text-[8px] md:text-[10px] font-black w-4 h-4 md:w-6 md:h-6 flex items-center justify-center rounded-full ${hoy ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400'}`}>
                    {dia.getDate()}
                  </span>
                </div>

                {/* INDICADORES DE CLASE */}
                <div className="flex flex-col gap-1 px-0.5">
                  {clases.map((clase, i) => {
                    const info = getEstadoInfo(clase);
                    const hora = clase.reprogramaciones_clases ? clase.reprogramaciones_clases.hora_inicio_destino : clase.inscripciones?.horarios_clases?.hora_inicio;

                    return (
                      <div key={i} className={`border-l-2 shadow-sm px-1 py-0.5 md:p-1.5 rounded-r text-center md:text-left ${info.color}`}>
                         {/* Vista Móvil (Solo Hora) */}
                         <p className="text-[7px] font-bold md:hidden leading-none tracking-tighter">
                           {formatTime(hora)}
                         </p>
                         {/* Vista Desktop (Completa) */}
                         <div className="hidden md:block">
                           <p className="text-[7px] font-black truncate uppercase italic leading-none">
                             {clase.inscripciones?.horarios_clases?.niveles_entrenamiento?.nombre || 'CLASE'}
                           </p>
                           <p className="text-[8px] font-bold opacity-70 mt-0.5">
                             {formatTime(hora)}
                           </p>
                         </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MonthlyCalendarDashboard;