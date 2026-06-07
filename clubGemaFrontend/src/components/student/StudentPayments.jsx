import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AlertCircle, Clock, CheckCircle2, ChevronRight,
  Loader2, Receipt, CreditCard, MessageSquare, ExternalLink, XCircle
} from 'lucide-react';
import { apiFetch } from '../../interceptors/api.js';
import { useAuth } from "../../context/AuthContext";
import ReportPaymentModal from './Payments/ReportPaymentModal.jsx';
import { API_ROUTES } from "../../constants/apiRoutes";

const StudentPayments = () => {
  const { userId } = useAuth();
  const [debts, setDebts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);

  const fetchPaymentData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const [resDebts, resPay] = await Promise.all([
       apiFetch.get(API_ROUTES.CUENTAS_POR_COBRAR.HISTORIAL(userId)),
        apiFetch.get(API_ROUTES.PAGOS.ALUMNO_HISTORIAL(userId)),
      ]);

      const dataDebts = await resDebts.json();
      const dataPay = await resPay.json();

      setDebts(dataDebts.data || []);
      setPayments(dataPay.data || []);
    } catch (error) {
      console.error("Error al cargar datos financieros:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPaymentData();
  }, [fetchPaymentData]);

  const handleOpenModal = (debt) => {
    setSelectedDebt(debt);
    setIsModalOpen(true);
  };

  // 🧠 LÓGICA MAESTRA DE ORDENAMIENTO POR PRIORIDAD
  const itemsOrdenados = useMemo(() => {
    const list = [];

    // 1. Prioridad Máxima (Urgente): Deudas PENDIENTES
    debts.filter(d => d.estado === 'PENDIENTE').forEach(d => {
      list.push({ ...d, sortType: 'DEBT_PENDING', priority: 1 });
    });

    // 2. Prioridad Alta: Pagos POR_VALIDAR / PENDIENTES
    payments.filter(p => p.estado_validacion === 'PENDIENTE' || p.estado_validacion === 'POR_VALIDAR').forEach(p => {
      list.push({ ...p, sortType: 'PAYMENT_PROCESS', priority: 2 });
    });

    // (Fallback)
    debts.filter(d => d.estado === 'POR_VALIDAR').forEach(d => {
      const hasPayment = payments.some(p => p.cuentas_por_cobrar?.id === d.id);
      if (!hasPayment) {
        list.push({ ...d, sortType: 'PAYMENT_PROCESS_FALLBACK', priority: 2 });
      }
    });

    // 3. Prioridad Media (Atención requerida): Pagos RECHAZADOS o ANULADOS
    payments.filter(p => p.estado_validacion === 'RECHAZADO' || p.estado_validacion === 'ANULADA').forEach(p => {
      list.push({ ...p, sortType: 'PAYMENT_ERROR', priority: 3 });
    });

    // 4. Prioridad Baja (Historial): Pagos APROBADOS
    payments.filter(p => p.estado_validacion === 'APROBADO').forEach(p => {
      list.push({ ...p, sortType: 'PAYMENT_SUCCESS', priority: 4 });
    });

    return list.sort((a, b) => a.priority - b.priority);
  }, [debts, payments]);

  if (loading) return (
    <div className="flex justify-center py-8">
      <Loader2 className="animate-spin text-orange-500" size={32} />
    </div>
  );

  return (
    <div className="space-y-4">
      {itemsOrdenados.map((item, idx) => {
        
        // --- 🔴 RENDER DEUDA PENDIENTE (Súper llamativo) ---
        if (item.sortType === 'DEBT_PENDING') {
          return (
            <div
              key={`debt-${item.id}-${idx}`}
              className="bg-orange-50/50 border border-orange-200 border-l-4 border-l-orange-500 rounded-xl p-4 flex justify-between items-center cursor-pointer shadow-sm hover:shadow-md hover:bg-orange-50 transition-all group"
              onClick={() => handleOpenModal(item)}
            >
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-2 rounded-xl text-white shadow-sm">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-orange-700 uppercase leading-none tracking-tight">
                    {item.catalogo_conceptos?.nombre || "Concepto Pendiente"}
                  </p>
                  <p className="text-[8px] text-orange-600 font-bold uppercase mt-1 flex items-center gap-1">
                    Requiere Pago <ChevronRight size={10} />
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-black text-orange-700 text-sm block leading-none">S/ {item.monto_final}</span>
              </div>
            </div>
          );
        }

        // --- 🟡 RENDER EN VALIDACIÓN (Visualmente en proceso) ---
        if (item.sortType === 'PAYMENT_PROCESS' || item.sortType === 'PAYMENT_PROCESS_FALLBACK') {
          return (
            <div key={`proc-${item.id}-${idx}`} className="bg-blue-50/50 border border-blue-200 border-l-4 border-l-blue-400 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                    <Clock size={18} className="animate-spin-slow" />
                  </div>
                  <div>
                    <span className="bg-blue-200 text-blue-800 text-[7px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest">En Revisión</span>
                    <p className="text-[10px] font-black text-[#1e3a8a] uppercase leading-none mt-1.5">
                      {item.cuentas_por_cobrar?.catalogo_conceptos?.nombre || item.catalogo_conceptos?.nombre || "Mensualidad"}
                    </p>
                  </div>
                </div>
                <span className="font-black text-blue-700 text-sm">
                  S/ {item.monto_pagado || item.monto_final}
                </span>
              </div>

              {item.metodos_pago && (
                <div className="flex items-center gap-4 pt-2 border-t border-blue-100">
                  <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-500 uppercase">
                    <CreditCard size={12} className="text-blue-500" /> {item.metodos_pago?.nombre}
                  </div>
                  <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-500 uppercase">
                    <Receipt size={12} className="text-blue-500" /> Op: {item.codigo_operacion}
                  </div>
                </div>
              )}
            </div>
          );
        }

        // --- ❌ RENDER ERROR (Rechazado - Alerta roja) ---
        if (item.sortType === 'PAYMENT_ERROR') {
          return (
            <div key={`err-${item.id}-${idx}`} className="bg-red-50/50 border border-red-200 border-l-4 border-l-red-500 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-start">
                 <div className="flex items-center gap-3">
                   <div className="bg-red-100 p-2 rounded-xl text-red-600">
                     <XCircle size={18} />
                   </div>
                   <div>
                     <span className="bg-red-200 text-red-800 text-[7px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest">{item.estado_validacion}</span>
                     <p className="text-[10px] font-black text-red-700 uppercase leading-none mt-1.5">
                       {item.cuentas_por_cobrar?.catalogo_conceptos?.nombre || "Revisar Pago"}
                     </p>
                   </div>
                 </div>
                 <span className="font-black text-red-700 text-sm">S/ {item.monto_pagado}</span>
              </div>
              <div className="bg-red-100/50 p-2.5 rounded-lg border border-red-100 mt-2">
                 <p className="text-[9px] text-red-600 font-medium leading-tight italic">
                   <span className="font-black uppercase block mb-0.5">Motivo:</span>
                   {item.notas_validacion || 'El pago no pudo ser validado. Contacte a la administración.'}
                 </p>
              </div>
            </div>
          );
        }

        // --- ✅ RENDER APROBADO (Historial, más sutil) ---
        if (item.sortType === 'PAYMENT_SUCCESS') {
          return (
            <div key={`ok-${item.id}-${idx}`} className="bg-white border border-slate-100 border-l-4 border-l-emerald-400 rounded-xl p-4 shadow-sm space-y-3 opacity-70 hover:opacity-100 transition-opacity">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-50 p-2 rounded-xl text-emerald-500">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block mb-0.5">Confirmado</span>
                    <p className="text-[9px] text-slate-500 font-bold uppercase">
                      {new Date(item.fecha_pago).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })} • {item.metodos_pago?.nombre}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-[#1e3a8a] text-sm block leading-none">S/ {item.monto_pagado}</span>
                  {item.url_comprobante && (
                    <a
                      href={item.url_comprobante}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[7px] text-orange-500 font-black uppercase flex items-center justify-end gap-0.5 mt-1 hover:underline"
                    >
                      Voucher <ExternalLink size={8} />
                    </a>
                  )}
                </div>
              </div>

              {item.notas_validacion && (
                <div className="bg-slate-50 rounded-lg p-2 flex gap-2 items-start border border-slate-100">
                  <MessageSquare size={12} className="text-slate-400 mt-0.5" />
                  <p className="text-[9px] text-slate-500 font-medium leading-tight">
                    <span className="font-bold text-slate-700 uppercase text-[8px]">Nota:</span> {item.notas_validacion}
                  </p>
                </div>
              )}
            </div>
          );
        }

        return null;
      })}

      {/* ESTADO VACÍO */}
      {itemsOrdenados.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 opacity-50">
          <Receipt className="text-slate-300 mb-2" size={36} />
          <p className="text-[10px] text-slate-400 font-black uppercase text-center italic tracking-widest leading-relaxed">
            Sin movimientos <br /> financieros
          </p>
        </div>
      )}

      {isModalOpen && selectedDebt && (
        <ReportPaymentModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedDebt(null); }}
          debt={selectedDebt}
          onSuccess={fetchPaymentData}
        />
      )}
    </div>
  );
};

export default StudentPayments;