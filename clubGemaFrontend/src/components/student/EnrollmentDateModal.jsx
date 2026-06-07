import React, { useMemo } from 'react';
import { Calendar, ArrowRight, Zap, Star, Info, X, RefreshCw } from 'lucide-react';
import dayjs from 'dayjs';

const EnrollmentDateModal = ({ isOpen, onClose, previewData, onConfirm }) => {
  if (!isOpen || !previewData) return null;

  const fechasOpciones = useMemo(() => {
    // 1. Extraemos las fechas base
    const inmediatas = previewData.map(grupo => grupo[0]); 
    const siguientes = previewData.map(grupo => grupo[1]); 
    
    // 2. Función de ordenamiento cronológico (Asegura que el 22 vaya antes que el 27)
    const sorter = (a, b) => (a > b ? 1 : -1);

    return {
      // Aplicamos Set para no repetir fechas y luego ordenamos explícitamente
      inmediatas: [...new Set(inmediatas)].sort(sorter),
      siguientes: [...new Set(siguientes)].sort(sorter)
    };
  }, [previewData]);

  const formatDateDetail = (dateStr) => {
    const d = dayjs(dateStr);
    // 🧠 Si la fecha es a más de 7 días, es un "enganche" (continuación)
    const isContinuacion = d.isAfter(dayjs().add(7, 'day')); 
    
    return {
      full: dateStr,
      num: d.format('DD'),
      mes: d.format('MMM').toUpperCase(),
      diaNom: d.format('dddd').toUpperCase(),
      isContinuacion
    };
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#0f172a]/80 backdrop-blur-md p-6">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="bg-white w-full max-w-[400px] rounded-[3rem] relative z-10 animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh] shadow-2xl border-4 border-white overflow-hidden">
        
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors">
          <X size={24} />
        </button>

        <div className="p-8 pb-4 text-center">
          <div className="bg-orange-50 text-orange-500 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Calendar size={28} />
          </div>
          <h2 className="text-2xl font-black text-[#1e3a8a] uppercase italic tracking-tighter leading-none">¿Cuándo empiezas?</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Elige tu fecha de debut</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8 scrollbar-hide text-center">
          
          {/* SECCIÓN 1: INICIO INMEDIATO / ENGANCHE */}
          <div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap size={14} className="text-orange-500" fill="currentColor" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lo más pronto posible</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {fechasOpciones.inmediatas.map((fecha, idx) => {
                const f = formatDateDetail(fecha);
                return (
                  <button
                    key={`now-${idx}`}
                    onClick={() => onConfirm(f.full)}
                    className="flex items-center justify-between p-4 bg-slate-50 hover:bg-orange-50 border-2 border-slate-100 hover:border-orange-500 rounded-[2rem] transition-all group active:scale-95"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#1e3a8a] text-white w-12 h-12 rounded-2xl flex flex-col items-center justify-center shadow-lg group-hover:bg-orange-600 transition-colors">
                        <span className="text-lg font-black leading-none">{f.num}</span>
                        <span className="text-[8px] font-bold">{f.mes}</span>
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black text-[#1e3a8a] uppercase italic">{f.diaNom}</p>
                        
                        {f.isContinuacion ? (
                           <div className="flex items-center gap-1 mt-0.5">
                             <RefreshCw size={10} className="text-green-600" />
                             <p className="text-[9px] font-bold text-green-600 uppercase">Continuación de paquete</p>
                           </div>
                        ) : (
                           <p className="text-[9px] font-bold text-slate-400 uppercase">Empezar esta semana</p>
                        )}
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-slate-300 group-hover:translate-x-1 group-hover:text-orange-500 transition-all" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECCIÓN 2: PRÓXIMO TURNO */}
          <div className="pb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star size={14} className="text-blue-500" fill="currentColor" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Siguiente Turno</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {fechasOpciones.siguientes.map((fecha, idx) => {
                const f = formatDateDetail(fecha);
                return (
                  <button
                    key={`next-${idx}`}
                    onClick={() => onConfirm(f.full)}
                    className="flex items-center justify-between p-4 bg-white hover:bg-blue-50 border-2 border-slate-100 hover:border-blue-400 rounded-[2rem] transition-all group active:scale-95"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-100 text-slate-400 w-12 h-12 rounded-2xl flex flex-col items-center justify-center border border-slate-200 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <span className="text-lg font-black leading-none">{f.num}</span>
                        <span className="text-[8px] font-bold">{f.mes}</span>
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black text-slate-600 uppercase italic">{f.diaNom}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Esperar a la siguiente</p>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-slate-300 group-hover:translate-x-1 group-hover:text-blue-500 transition-all" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
           <div className="flex items-center gap-3 bg-blue-100/50 p-3 rounded-2xl border border-blue-200">
              <Info size={16} className="text-blue-600 shrink-0" />
              <p className="text-[9px] font-bold text-blue-800 uppercase leading-tight italic">Tus 30 días de ciclo contarán a partir de la fecha que inicies.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentDateModal;