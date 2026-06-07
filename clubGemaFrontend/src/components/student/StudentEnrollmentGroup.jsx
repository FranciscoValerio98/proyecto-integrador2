import React from 'react';
import { MapPin, CheckCircle2, Zap, AlertTriangle } from 'lucide-react';

const StudentEnrollmentGroup = ({ group, selectedIds, onToggle }) => {
  const daysShort = ["", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM"];
  
  const idsDelGrupo = group.opciones.map(o => o.id);
  const seleccionadosDelGrupo = idsDelGrupo.filter(id => selectedIds.includes(id));
  const todoSeleccionado = seleccionadosDelGrupo.length === idsDelGrupo.length;
  const algunoSeleccionado = seleccionadosDelGrupo.length > 0;
  const faltaSeleccionar = idsDelGrupo.length > 1 && algunoSeleccionado && !todoSeleccionado;

  const toggleTodoElBloque = (e) => {
    e.stopPropagation();
    if (todoSeleccionado) {
      idsDelGrupo.forEach(id => { if (selectedIds.includes(id)) onToggle(id); });
    } else {
      idsDelGrupo.forEach(id => { if (!selectedIds.includes(id)) onToggle(id); });
    }
  };

  return (
    <div className={`bg-white rounded-[2.5rem] p-5 md:p-6 shadow-sm border-2 transition-all duration-500 flex flex-col md:flex-row items-center gap-4 md:gap-6 group relative ${
      todoSeleccionado ? 'border-green-500 bg-green-50/10' : algunoSeleccionado ? 'border-orange-500 bg-orange-50/5' : 'border-slate-100'
    }`}>
      
      {/* Nivel Badge */}
      <div className="flex flex-col items-center justify-center md:border-r md:border-slate-100 md:pr-8 min-w-[120px]">
        <span className="text-[7px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1 italic">Nivel Gema</span>
        <div className={`px-4 py-1.5 rounded-xl transition-all duration-500 ${todoSeleccionado ? 'bg-green-500' : 'bg-[#1e3a8a]'} text-white`}>
          <span className="font-black uppercase italic text-[10px] tracking-tighter">
            {group.nivel}
          </span>
        </div>
      </div>

      {/* Info Central */}
      <div className="flex-1 text-center md:text-left w-full">
        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
          <MapPin size={12} className={todoSeleccionado ? "text-green-500" : "text-orange-500"} />
          <span className="text-[10px] font-black text-[#1e3a8a] uppercase italic">{group.sede}</span>
        </div>
        <h3 className="text-3xl font-black text-[#1e3a8a] tracking-tighter italic leading-none">
          {group.hora}
        </h3>
        <p className="text-[9px] font-bold text-slate-400 uppercase italic mt-1 mb-3">
          Cancha: <span className="text-orange-500">{group.cancha}</span>
        </p>
        
        {/* BOTÓN MASTER RECONTRA EXPLICITO */}
        {idsDelGrupo.length > 1 && (
          <button 
            onClick={toggleTodoElBloque}
            className={`w-full md:w-auto flex items-center justify-center gap-3 px-6 py-3 rounded-2xl text-[9px] font-black uppercase italic transition-all shadow-lg ${
              todoSeleccionado 
              ? 'bg-green-500 text-white' 
              : faltaSeleccionar 
              ? 'bg-orange-500 text-white animate-pulse'
              : 'bg-slate-100 text-slate-400 hover:bg-blue-100 hover:text-[#1e3a8a]'
            }`}
          >
            {todoSeleccionado ? <CheckCircle2 size={14} /> : faltaSeleccionar ? <AlertTriangle size={14} /> : <Zap size={14} fill="currentColor" />}
            <span>
              {todoSeleccionado 
                ? '¡LISTO! BLOQUE COMPLETO' 
                : faltaSeleccionar 
                ? `¡CUIDADO! TE FALTA ${idsDelGrupo.length - seleccionadosDelGrupo.length} DÍA` 
                : `MARCAR LOS ${idsDelGrupo.length} DÍAS JUNTOS`}
            </span>
          </button>
        )}
      </div>

      {/* Selector de Días Individuales */}
      <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-[2rem] border border-slate-100 relative">
        {group.opciones.map((horario) => {
          const isSelected = selectedIds.includes(horario.id);
          return (
            <button
              key={horario.id}
              onClick={() => onToggle(horario.id)}
              className={`h-14 w-14 md:h-16 md:w-16 rounded-2xl font-black text-[10px] transition-all duration-300 flex flex-col items-center justify-center relative border-2 ${
                isSelected 
                ? 'bg-[#1e3a8a] border-[#1e3a8a] text-white shadow-xl scale-110 z-10' 
                : 'bg-white border-transparent text-slate-400 hover:border-orange-400'
              }`}
            >
              <span className="italic">{daysShort[horario.dia_semana]}</span>
              <span className={`text-[6px] font-black mt-1 px-2 py-0.5 rounded-full ${isSelected ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                {isSelected ? 'ELEGIDO' : 'LIBRE'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StudentEnrollmentGroup;