import React from 'react';
import { CheckCircle, Clock, XCircle, ExternalLink, MessageCircleWarning } from 'lucide-react';

const PaymentHistoryItem = ({ payment }) => {
  const statusConfig = {
    PENDIENTE: { color: 'text-orange-500', bgColor: 'bg-orange-50', icon: Clock, label: 'EN VALIDACIÓN' },
    APROBADO: { color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle, label: 'APROBADO' },
    RECHAZADO: { color: 'text-red-600', bgColor: 'bg-red-50', icon: XCircle, label: 'RECHAZADO' }
  };

  const config = statusConfig[payment.estado_validacion] || statusConfig.PENDIENTE;
  const Icon = config.icon;
  const esAbono = payment.notas_validacion?.includes("ABONO PARCIAL");
  const esRechazado = payment.estado_validacion === 'RECHAZADO';

  return (
    <div className="p-6 flex flex-col hover:bg-slate-50 transition-all group border-b border-slate-50 last:border-0">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-5">
          {/* Icono de Estado */}
          <div className={`w-14 h-14 ${config.bgColor} ${config.color} rounded-2xl flex items-center justify-center shadow-sm group-hover:rotate-3 transition-transform`}>
            <Icon size={28} strokeWidth={2.5} />
          </div>
          
          <div>
            <div className="flex items-center gap-3">
              <h4 className="font-black text-slate-700 text-sm uppercase italic leading-none tracking-tight">
                {payment.cuentas_por_cobrar?.detalle_adicional || 'CUOTA CLUB GEMA'}
              </h4>
              {esAbono && (
                <span className="bg-[#1e3a8a] text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase italic tracking-widest">
                  ABONO
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.1em]">
                {new Date(payment.fecha_pago).toLocaleDateString()}
              </p>
              <span className="h-1 w-1 bg-slate-200 rounded-full"></span>
              <p className={`text-[10px] font-black uppercase italic ${config.color}`}>
                {config.label}
              </p>
            </div>
          </div>
        </div>

        <div className="text-right flex flex-col items-end">
          <span className="font-black text-[#1e3a8a] italic text-xl tracking-tighter">
            S/ {payment.monto_pagado}
          </span>
          {payment.url_comprobante && (
            <a 
              href={payment.url_comprobante} 
              target="_blank" 
              rel="noreferrer"
              className="text-[9px] font-black text-blue-400 uppercase flex items-center gap-1 hover:text-orange-500 mt-1 transition-colors underline decoration-blue-200"
            >
              VOUCHER <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>

      {/* NOTA DE VALIDACIÓN: Solo aparece si el admin escribió algo */}
      {payment.notas_validacion && (
        <div className={`mt-4 p-3 rounded-xl flex items-start gap-3 border ${esRechazado ? 'bg-red-50 border-red-100 text-red-700' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
          <MessageCircleWarning size={16} className={`shrink-0 mt-0.5 ${esRechazado ? 'text-red-500' : 'text-slate-400'}`} />
          <div className="flex flex-col">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Nota del Administrador:</p>
            <p className="text-[11px] font-bold italic leading-tight mt-0.5">{payment.notas_validacion}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryItem;