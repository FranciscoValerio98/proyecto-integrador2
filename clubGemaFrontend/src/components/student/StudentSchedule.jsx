import React, { useMemo } from 'react';
import { Clock, MapPin, User, Star, Zap, CheckCircle2, CircleDashed, Calendar, RefreshCw, CalendarX, ArrowRight, Sparkles, History, AlertCircle } from 'lucide-react';

const StudentSchedule = ({ attendance = [], filtroMes, filtroAnio }) => {
  const diasSemana = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const parseLocalDate = (fechaString) => {
    if (!fechaString) return new Date();
    const date = new Date(fechaString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date;
  };

  const formatTimeDirect = (timeSource) => {
    if (!timeSource) return '--:--';
    if (typeof timeSource === 'string') {
      const match = timeSource.match(/(\d{2}:\d{2})/);
      return match ? match[1] : timeSource.substring(0, 5);
    }
    return new Date(timeSource).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const sesionesFiltradas = useMemo(() => {
    return attendance
      .filter(s => {
        if (s.comentario && s.comentario.includes('[RECUPERACION]')) return false;
        const fechaBase = s.fecha || s.fecha_programada;
        if (!fechaBase) return false;

        const fechaSesion = parseLocalDate(s.fecha);
        const matchMes = filtroMes === "TODOS" || fechaSesion.getMonth().toString() === filtroMes;
        const matchAnio = fechaSesion.getFullYear().toString() === filtroAnio;
        const tieneHorario = s?.inscripciones?.horarios_clases || s?.horarios_clases;

        return tieneHorario && matchMes && matchAnio;
      })
      .sort((a, b) => new Date(a.fecha || a.fecha_programada) - new Date(b.fecha || b.fecha_programada));
  }, [attendance, filtroMes, filtroAnio]);

  const sesionesPorMes = useMemo(() => {
    return sesionesFiltradas.reduce((acc, sesion) => {
      const fecha = parseLocalDate(sesion.fecha);
      const mesAnio = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
      if (!acc[mesAnio]) acc[mesAnio] = [];
      acc[mesAnio].push(sesion);
      return acc;
    }, {});
  }, [sesionesFiltradas]);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return (
    <div className="flex flex-col h-full bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden animate-fade-in">
      {/* HEADER COMPACTO PARA MÓVIL */}
      <div className="px-5 py-4 md:px-8 md:py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-1.5 md:w-2 h-6 md:h-8 bg-[#1e3a8a] rounded-full"></div>
          <h2 className="font-black text-[#1e3a8a] uppercase tracking-tight text-sm md:text-lg italic leading-none">Mi Plan de<br className="md:hidden"/> Entrenamiento</h2>
        </div>
        <Zap size={20} className="text-orange-500 fill-orange-500/20 shrink-0" />
      </div>

      <div className="p-4 md:p-6 space-y-6 flex-grow overflow-y-auto max-h-[600px] md:max-h-[750px] custom-scrollbar bg-slate-50/30">
        {Object.keys(sesionesPorMes).length > 0 ? Object.entries(sesionesPorMes).map(([mes, items]) => (
          <div key={mes} className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-3 py-1">
              <span className="text-[9px] md:text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] whitespace-nowrap italic">{mes}</span>
              <div className="h-px w-full bg-slate-200"></div>
            </div>

            {items.map((sesion) => {
              const horario = sesion?.inscripciones?.horarios_clases || sesion?.horarios_clases;
              const esRecuperacion = sesion.horario_destino_id || sesion.isRecuperacion;
              const estadoReal = sesion.estado === 'COMPLETADA_PRESENTE' ? 'PRESENTE' : sesion.estado === 'COMPLETADA_FALTA' ? 'FALTA' : sesion.estado;
              
              const coordinatorData = horario?.coordinadores?.usuarios;
              const nombreLider = coordinatorData ? `${coordinatorData.nombres.trim()} ${coordinatorData.apellidos.trim()}` : 'COORDINADOR GEMA';

              const horaInicioMostrar = sesion.reprogramaciones_clases ? sesion.reprogramaciones_clases.hora_inicio_destino + ":00" : horario?.hora_inicio;
              const horaFinMostrar = sesion.reprogramaciones_clases ? sesion.reprogramaciones_clases.hora_fin_destino + ":00" : horario?.hora_fin;
              
              const fechaObj = parseLocalDate(sesion.fecha || sesion.fecha_programada);
              const fechaSesionFinDia = new Date(fechaObj);
              fechaSesionFinDia.setHours(23, 59, 59, 0);
              
              const esPasada = fechaSesionFinDia < hoy && estadoReal === 'PROGRAMADA';
              const esPresente = estadoReal === 'PRESENTE';
              const esFalta = estadoReal === 'FALTA';
              const esReprogramado = estadoReal === 'REPROGRAMADO';

              return (
                <div key={esRecuperacion ? `recu-${sesion.id}` : `asist-${sesion.id}`} className={`group relative rounded-2xl md:rounded-[2rem] border transition-all duration-300 ${esPresente ? 'bg-green-50/50 border-green-200 shadow-sm' : esFalta ? 'bg-red-50/50 border-red-200 shadow-sm' : esReprogramado ? 'bg-slate-50/30 border-slate-200 border-dashed opacity-60 grayscale-[0.5]' : sesion.fecha_original || sesion.tipo_sesion === 'REPOSICION' ? 'bg-gradient-to-br from-violet-50/80 to-indigo-50/80 border-violet-200 shadow-md' : 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-xl'}`}>

                  {(sesion.fecha_original || sesion.tipo_sesion === 'REPOSICION') && !esReprogramado && (
                    <div className="absolute -top-2 -left-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white p-1 md:p-1.5 rounded-full shadow-lg border-2 border-white z-20 animate-bounce-slow">
                      <Sparkles size={10} className="md:w-3 md:h-3" />
                    </div>
                  )}

                  {(esRecuperacion || sesion.tipo_sesion === 'RECUPERACION') && (
                    <div className="absolute top-0 right-0 bg-blue-500 text-white flex items-center gap-1 text-[7px] md:text-[8px] font-black px-3 py-1 rounded-bl-xl md:rounded-bl-2xl italic tracking-tighter z-10">
                      <RefreshCw size={8} className="md:w-2.5 md:h-2.5" /> RECUPERACIÓN
                    </div>
                  )}
                  
                  <div className="p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">

                    {/* SECCIÓN FECHA Y HORA */}
                    <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto md:min-w-[140px]">
                      <div className={`flex flex-col items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl font-black shadow-sm md:shadow-md shrink-0 ${esPresente ? 'bg-green-600 text-white' : esFalta ? 'bg-red-600 text-white' : esReprogramado ? 'bg-slate-400 text-white' : 'bg-[#1e3a8a] text-white'}`}>
                        <span className="text-[7px] md:text-[9px] opacity-70 uppercase italic leading-none mt-1">{diasSemana[fechaObj.getDay()]}</span>
                        <span className="text-xl md:text-2xl leading-none">{fechaObj.getDate()}</span>
                      </div>
                      
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-1 text-orange-500 font-black">
                          <Clock size={10} className="md:w-3 md:h-3 shrink-0" />
                          <span className="text-[11px] md:text-[10px] uppercase tracking-tighter">
                            {formatTimeDirect(horaInicioMostrar)} - {formatTimeDirect(horaFinMostrar)}
                          </span>
                        </div>
                        
                        {/* 🔥 ADIÓS A LA PALABRA "REGULAR". SOLO MOSTRAR SI ES ESPECIAL */}
                        {(esReprogramado || sesion.fecha_original || sesion.tipo_sesion === 'REPOSICION') && (
                          <h4 className="flex items-center gap-1 text-[10px] md:text-[11px] font-black text-[#1e3a8a] uppercase italic leading-tight mt-0.5 line-clamp-1">
                            {esReprogramado ? <>Movida <ArrowRight size={10} className="text-slate-400" /></> : 'Reposición'}
                          </h4>
                        )}

                        {(sesion.fecha_original || sesion.tipo_sesion === 'REPOSICION') && !esReprogramado && (
                          <div className="mt-0.5 flex items-center gap-1 text-indigo-600">
                            <History size={8} />
                            <span className="text-[7px] md:text-[8px] font-black italic uppercase tracking-tighter truncate">
                              Orig: {parseLocalDate(sesion.fecha_original || sesion.fecha).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SECCIÓN DETALLES (TEXTOS COMPLETOS) */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 w-full border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6">
                      
                      <div className="space-y-0.5 text-left">
                        <p className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest">Sede</p>
                        <div className="flex items-start gap-1 text-[9px] md:text-[10px] font-bold text-slate-600 uppercase italic">
                          <MapPin size={10} className="text-blue-500 shrink-0 mt-0.5" />
                          {/* 🔥 SIN TRUNCATE PARA VER LA SEDE COMPLETA */}
                          <span className="whitespace-normal leading-tight">{horario?.canchas?.nombre || 'T1'}</span>
                        </div>
                      </div>

                      <div className="space-y-0.5 text-left">
                        <p className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest">Nivel</p>
                        <div className="flex items-start gap-1 text-[9px] md:text-[10px] font-bold text-slate-600 uppercase italic">
                          <Star size={10} className="text-yellow-500 fill-yellow-500 shrink-0 mt-0.5" />
                          {/* 🔥 SIN TRUNCATE PARA VER EL NIVEL COMPLETO */}
                          <span className="whitespace-normal leading-tight">{horario?.niveles_entrenamiento?.nombre || 'Formativo'}</span>
                        </div>
                      </div>

                      <div className="space-y-0.5 hidden lg:block text-left">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Coordinador</p>
                        <div className="flex items-start gap-1 text-[10px] font-black text-[#1e3a8a] uppercase italic">
                          <User size={10} className="text-indigo-500 shrink-0 mt-0.5" />
                          <span className="whitespace-normal leading-tight">{nombreLider}</span>
                        </div>
                      </div>
                    </div>

                    {/* STATUS BADGE */}
                    <div className={`w-full md:w-auto shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase italic shadow-sm border mt-1 md:mt-0 ${esPresente ? 'bg-green-100 text-green-700 border-green-200' : esFalta ? 'bg-red-100 text-red-700 border-red-200' : esReprogramado ? 'bg-slate-200 text-slate-500 border-slate-300' : sesion.fecha_original ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                      {esPresente ? <CheckCircle2 size={12} strokeWidth={3} /> : esReprogramado ? <CalendarX size={12} strokeWidth={3} /> : esPasada ? <AlertCircle size={12} strokeWidth={2} /> : (sesion.fecha_original || sesion.tipo_sesion === 'REPOSICION') ? <RefreshCw size={12} className="animate-pulse" /> : <CircleDashed size={12} className={sesion.estado === 'PROGRAMADA' ? "animate-spin-slow" : ""} />}
                      {esReprogramado ? 'MOVIDA' : esPasada ? 'PASADA' : (sesion.fecha_original || sesion.tipo_sesion === 'REPOSICION') ? 'REPOSICIÓN' : sesion.estado === 'PROGRAMADA' ? 'PRÓXIMA' : sesion.estado}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )) : (
          <div className="py-20 md:py-32 text-center space-y-3 md:space-y-4">
            <Calendar className="mx-auto text-slate-200" size={48} strokeWidth={1} />
            <p className="text-slate-400 font-black uppercase italic tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs">No hay sesiones</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSchedule;