import React from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';

const DebtItem = ({ debt, onReport }) => {
  const isPendingValidation = debt.estado === 'POR_VALIDAR';

  return (
    <div className="relative p-8 rounded-[2.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/50 group transition-all">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1">
            <h3 className="font-black text-[#1e3a8a] uppercase tracking-tighter text-2xl leading-none italic group-hover:text-orange-500 transition-colors">
              {debt.catalogo_conceptos?.nombre}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black text-[#1e3a8a] tracking-tighter italic">
              <span className="text-lg mr-1 italic">S/</span>{debt.monto_final}
            </p>
          </div>
        </div>

        <div className="h-px bg-slate-50" />

        {debt.esParcial && (
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <p className="text-[11px] font-black text-[#1e3a8a] uppercase italic tracking-widest">SALDO PENDIENTE</p>
              <p className="text-lg font-black text-orange-600 italic">FALTAN S/ {debt.saldoRestante.toFixed(2)}</p>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#1e3a8a] transition-all duration-700"
                style={{ width: `${(debt.montoPagadoYa / debt.monto_final) * 100}%` }}
              />
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-3 italic text-center uppercase tracking-tighter">
              Has cubierto S/ {debt.montoPagadoYa.toFixed(2)} del total.
            </p>
          </div>
        )}

        <button 
          onClick={() => onReport(debt)}
          disabled={isPendingValidation}
          className={`
            w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase italic tracking-widest text-[12px] transition-all shadow-lg
            ${isPendingValidation 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
              : 'bg-[#1e3a8a] hover:bg-[#2b4fa1] text-white shadow-blue-900/10 active:scale-95'}
          `}
        >
          {isPendingValidation ? 'PAGO EN VALIDACIÓN' : debt.esParcial ? 'COMPLETAR DEUDA' : 'REPORTAR PAGO OFICIAL'}
          {!isPendingValidation && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
        </button>
      </div>
    </div>
  );
};

export default DebtItem;