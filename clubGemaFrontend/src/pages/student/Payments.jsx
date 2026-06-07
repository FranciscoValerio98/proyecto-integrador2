import React, { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../../interceptors/api";
import { useAuth } from "../../context/AuthContext";
import { Loader2, ArrowLeft, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { API_ROUTES } from "../../constants/apiRoutes";

import PaymentMethodCard from "../../components/student/Payments/PaymentMethodCard";
import DebtItem from "../../components/student/Payments/DebtItem";
import PaymentHistoryItem from "../../components/student/Payments/PaymentHistoryItem";
import ReportPaymentModal from "../../components/student/Payments/ReportPaymentModal";

const Payments = () => {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [debts, setDebts] = useState([]);
  const [payments, setPayments] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);

  const fetchFinancialData = useCallback(async () => {
    try {
      setLoading(true);
      const [resDebts, resPayments] = await Promise.all([
        apiFetch.get(API_ROUTES.CUENTAS_POR_COBRAR.HISTORIAL(userId)),
        apiFetch.get(API_ROUTES.PAGOS.ALUMNO_HISTORIAL(userId)),
      ]);

      const dataDebts = await resDebts.json();
      const dataPayments = await resPayments.json();

      if (resDebts.ok) setDebts(dataDebts.data || []);
      if (resPayments.ok) setPayments(dataPayments.data || []);
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchFinancialData();
  }, [userId, fetchFinancialData]);

  const activeDebts = debts.filter((d) =>
    ["PENDIENTE", "PARCIAL", "POR_VALIDAR"].includes(d.estado)
  );

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-orange-500" size={48} />
      <p className="font-black text-[#1e3a8a] uppercase italic text-xs tracking-widest">Cargando...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in pb-24">
      <Link to="/dashboard/student" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#1e3a8a] mb-6 text-[10px] font-black uppercase tracking-widest italic transition-colors">
        <ArrowLeft size={14} /> REGRESAR AL PANEL
      </Link>

      <div className="mb-10 text-center md:text-left">
        <h1 className="text-5xl font-black text-[#1e3a8a] uppercase tracking-tighter italic leading-none">
          CENTRO DE <span className="text-orange-500">PAGOS</span>
        </h1>
        <div className="h-2 w-24 bg-orange-500 rounded-full mt-3 mx-auto md:mx-0"></div>
      </div>

      <PaymentMethodCard />

      {/* 🔥 AVISO DE CONTINUIDAD GEMA PREMIUM - VERSIÓN FINAL ALINEADA 🔥 */}
      {activeDebts.length > 0 && (
        <div className="w-full my-12 relative overflow-hidden shadow-2xl rounded-[3rem] group">
          {/* Fondo con Gradiente Sólido */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff4d4d] via-[#f87171] to-[#ff4d4d] opacity-95"></div>

          <div className="relative z-10 w-full p-8 md:p-12 border-4 border-white/40 rounded-[3rem] flex flex-col md:flex-row items-center gap-8 md:gap-12">

            {/* Icono con Pulso de Alerta */}
            <div className="bg-white shadow-xl p-5 rounded-[2.2rem] shrink-0">
              <ShieldAlert size={48} strokeWidth={2.5} className="text-[#ff4d4d] animate-pulse" />
            </div>

            <div className="flex-1 text-center md:text-left">
              {/* Cabecera con Badge de Estado */}
              <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <h4 className="font-black uppercase italic tracking-tighter text-3xl md:text-4xl text-white leading-none">
                  Aviso de Continuidad <span className="text-red-100">Crítico</span>
                </h4>
                <span className="bg-white/20 backdrop-blur-sm text-white text-[9px] font-black px-4 py-1.5 rounded-full border border-white/40 uppercase tracking-[0.2em]">
                  Estado Administrativo
                </span>
              </div>

              {/* Mensaje con Cápsulas Rectas (Sin inclinaciones chuecas) */}
              <div className="text-[13px] md:text-[15px] font-bold text-white/95 leading-relaxed uppercase tracking-tight">
                Estimado alumno: Le informamos que el acceso a nuevas inscripciones y el derecho al beneficio de
                <span className="inline-block mx-2 bg-white text-[#ff4d4d] px-4 py-1.5 rounded-xl font-black italic shadow-md">
                  Recuperación de Clases
                </span>
                se encuentran suspendidos temporalmente hasta la liquidación del
                <span className="inline-block mx-2 bg-[#1e3a8a] text-white px-4 py-1.5 rounded-xl font-black italic shadow-md">
                  Pago Completo
                </span>
                de sus deudas pendientes.
              </div>
            </div>

            {/* Decoración de Fondo Limpia */}
            <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
              <ShieldAlert size={180} color="white" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* CUENTAS PENDIENTES */}
        <section>
          <h2 className="font-black text-[#1e3a8a] uppercase italic mb-8 flex items-center gap-3 text-2xl">
            <div className="w-3 h-8 bg-orange-500 rounded-full"></div>
            CUENTAS PENDIENTES
          </h2>
          <div className="space-y-6">
            {activeDebts.map((d) => {
              const pagado = (d.pagos || []).reduce((acc, p) => acc + parseFloat(p.monto_pagado), 0);
              const saldo = parseFloat(d.monto_final) - pagado;
              return (
                <DebtItem
                  key={d.id}
                  debt={{ ...d, saldoRestante: saldo, montoPagadoYa: pagado, esParcial: pagado > 0 }}
                  onReport={(debt) => { setSelectedDebt(debt); setIsModalOpen(true); }}
                />
              );
            })}
          </div>
        </section>

        {/* HISTORIAL DE REPORTES */}
        <section className="sticky top-8">
          <h2 className="font-black text-[#1e3a8a] uppercase italic mb-8 flex items-center gap-3 text-2xl">
            <div className="w-3 h-8 bg-blue-400 rounded-full"></div>
            HISTORIAL DE REPORTES
          </h2>

          <div className="bg-white rounded-[2.5rem] border shadow-2xl overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {payments.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {payments.map((p) => (
                    <PaymentHistoryItem key={p.id} payment={p} />
                  ))}
                </div>
              ) : (
                <div className="p-20 text-center text-slate-300 font-black uppercase italic text-xs tracking-widest">
                  Sin reportes registrados
                </div>
              )}
            </div>
          </div>

          {payments.length > 3 && (
            <div className="mt-4 flex justify-center">
              <span className="text-[10px] font-black text-slate-300 uppercase italic tracking-widest animate-bounce">
                ↓ Desliza para ver más reportes ↓
              </span>
            </div>
          )}
        </section>
      </div>

      <ReportPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        debt={selectedDebt}
        onSuccess={() => fetchFinancialData()}
      />
    </div>
  );
};

export default Payments;