import React, { useState, memo, useMemo } from 'react';
import { AlertCircle, CreditCard, ArrowRight, Banknote, Trash2, Loader2, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../interceptors/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const OutstandingDebtAlert = ({ pendingPayment, onRefresh, onPay }) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  // 🧮 CÁLCULO DE SALDOS DINÁMICOS
  const stats = useMemo(() => {
    const total = Number(pendingPayment?.monto_final || 0);
    
    const pagado = (pendingPayment?.pagos || [])
      .filter(p => p.estado_validacion !== 'RECHAZADO')
      .reduce((acc, curr) => acc + Number(curr.monto_pagado), 0);
    
    const restante = total - pagado;
    const parcial = pagado > 0 || pendingPayment?.estado === 'PARCIAL';
    
    return {
      montoTotal: total,
      montoPagado: pagado,
      saldoRestante: restante,
      esParcial: parcial,
      porcentaje: total > 0 ? Math.min((pagado / total) * 100, 100) : 0
    };
  }, [pendingPayment]);

  if (!pendingPayment) return null;

  // 🔥 FUNCIÓN PARA ABRIR EL MODAL CON EL MONTO CORRECTO
  const handlePayClick = () => {
    if (onPay) {
      // Enviamos el objeto enriquecido con el saldo restante 
      // para que el modal use 'monto_final' como lo que falta pagar
      const debtForModal = {
        ...pendingPayment,
        monto_original_plan: stats.montoTotal, // Guardamos el original por si acaso
        monto_final: stats.saldoRestante,      // 🚩 Sobreescribimos con lo que falta
        es_abono_final: stats.esParcial
      };
      onPay(debtForModal);
    } else {
      navigate('/dashboard/student/payments');
    }
  };

  const handleCancelPackage = async () => {
    const result = await Swal.fire({
      title: '<span class="italic font-black uppercase text-[#1e3a8a]">¿CANCELAR RESERVA?</span>',
      html: `<p class="text-sm font-bold text-slate-600">Se anulará la deuda de S/ ${stats.montoTotal.toFixed(2)}</p>`,
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'SÍ, CANCELAR',
      customClass: { popup: 'rounded-[3rem] p-8' }
    });

    if (result.isConfirmed) {
      setIsDeleting(true);
      try {
        const response = await apiFetch.delete(`/inscripciones/paquete/${pendingPayment.id}`);
        if (response.ok) {
          toast.success("Reserva eliminada");
          if (onRefresh) await onRefresh(); 
        }
      } catch (e) { toast.error("Error de conexión"); } 
      finally { setIsDeleting(false); }
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-[3.5rem] p-8 md:p-10 text-white shadow-2xl animate-fade-in mb-8 ${stats.esParcial ? 'bg-gradient-to-br from-[#2563eb] to-[#1e3a8a] border-b-8 border-blue-900/50' : 'bg-gradient-to-br from-[#f97316] to-[#ea580c] border-b-8 border-orange-800/40'}`}>
      
      <div className="absolute top-8 right-10">
        <span className="bg-white/20 backdrop-blur-md px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
          {stats.esParcial ? 'Abono Detectado' : 'Pendiente de Pago'}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="flex flex-col md:flex-row items-center gap-8 flex-1 w-full text-center md:text-left">
          
          <div className="bg-white/10 p-6 rounded-[2.5rem] border-2 border-white/20 shrink-0 shadow-inner">
            {stats.esParcial ? <Info size={44} className="text-blue-100" /> : <Banknote size={44} />}
          </div>

          <div className="space-y-4 w-full">
            <div className="space-y-1">
               <div className="flex items-center justify-center md:justify-start gap-3 opacity-80">
                 <AlertCircle size={16} />
                 <span className="font-black uppercase text-[11px] tracking-[0.2em] italic">
                   {stats.esParcial ? 'Sincronización de Saldo Gema' : 'Aviso: Pago Obligatorio'}
                 </span>
               </div>
               <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
                 {pendingPayment.catalogo_conceptos?.nombre || 'Plan Gema'}
               </h2>
            </div>

            {stats.esParcial ? (
              <div className="bg-white/10 p-5 rounded-[2rem] border border-white/10 max-w-xl">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[10px] font-black uppercase italic tracking-widest opacity-70 text-blue-100 text-left">Saldo Pendiente</p>
                  <p className="text-xl font-black text-orange-400 italic">FALTAN S/ {stats.saldoRestante.toFixed(2)}</p>
                </div>
                
                <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-white transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                    style={{ width: `${stats.porcentaje}%` }}
                  />
                </div>
                
                <p className="text-[10px] font-bold text-white/60 mt-3 italic text-center uppercase tracking-widest text-left">
                  Has cubierto S/ {stats.montoPagado.toFixed(2)} de S/ {stats.montoTotal.toFixed(2)}
                </p>
              </div>
            ) : (
              <div className="pt-2">
                <p className="text-white text-5xl font-black italic tracking-tighter leading-none">
                  S/ {stats.montoTotal.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row lg:flex-col gap-4 w-full lg:w-72">
          <button 
            onClick={handlePayClick}
            className={`flex-1 py-5 rounded-[1.8rem] font-black uppercase italic text-sm flex items-center justify-center gap-3 transition-all shadow-2xl active:scale-95 border-b-4 ${stats.esParcial ? 'bg-[#f97316] hover:bg-[#ea580c] border-[#9a3412] text-white' : 'bg-white text-[#1e3a8a] border-slate-200 hover:bg-slate-50'}`}
          >
            <CreditCard size={20} /> 
            {stats.esParcial ? 'Pagar Saldo' : 'Pagar Ahora'} 
            <ArrowRight size={20} />
          </button>

          {!stats.esParcial && (
            <button 
              onClick={handleCancelPackage}
              disabled={isDeleting}
              className="flex-1 bg-black/20 hover:bg-rose-600 text-white py-4 rounded-[1.8rem] font-black uppercase italic text-[10px] flex items-center justify-center gap-3 transition-colors border-2 border-white/10 disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
              Anular Inscripción
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(OutstandingDebtAlert);