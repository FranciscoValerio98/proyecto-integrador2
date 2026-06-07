import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom'; // 👈 IMPORTANTE: Agregado para el botón del Empty State
import {
  Clock, Trash2, Loader2, Calendar, Trophy, Receipt,
  Zap, History, ChevronDown, Dumbbell, MapPin, Activity,
  ArrowRight as ArrowIcon, AlertTriangle, CalendarSearch, Rocket
} from 'lucide-react';
import apiFetch from '../../interceptors/api.js';
import { API_ROUTES } from '../../constants/apiRoutes';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

// COMPONENTES DE SEGURIDAD Y PAGO
import OutstandingDebtAlert from '../../components/student/OutstandingDebtAlert';
import ReportPaymentModal from "../../components/student/Payments/ReportPaymentModal";

dayjs.locale('es');

const DIAS_NOMBRES = { 1: "LUNES", 2: "MARTES", 3: "MIÉRCOLES", 4: "JUEVES", 5: "VIERNES", 6: "SÁBADO", 7: "DOMINGO", 0: "DOMINGO" };

// --- MODAL DE RENOVACIÓN ---
const RenovacionModal = ({ isOpen, onClose, onConfirm, fechasSugeridas }) => {
  if (!isOpen || !fechasSugeridas) return null;
  const etiquetas = [
    { label: 'RENOVACIÓN INMEDIATA', desc: 'Inicia en tu próxima clase.', style: 'border-green-500 bg-green-50/50', iconColor: 'text-green-600' },
    { label: 'REPROGRAMACIÓN +1 SESIÓN', desc: 'Saltas un turno y retomas.', style: 'border-slate-300 bg-slate-50/50', iconColor: 'text-blue-600' },
    { label: 'REINICIO POSTERGADO', desc: 'Retoma en una semana.', style: 'border-slate-200 bg-white', iconColor: 'text-orange-600' }
  ];

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-[#0f172a]/95 backdrop-blur-xl p-6">
      <div className="bg-white w-full max-w-[420px] rounded-[3.5rem] relative shadow-2xl border-4 border-white overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center bg-slate-50/80 border-b border-slate-100">
          <div className="bg-[#1e3a8a] text-white w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl"><Zap size={24} fill="white" /></div>
          <h2 className="text-2xl font-black text-[#1e3a8a] uppercase italic tracking-tighter leading-none">Renovación Gema</h2>
        </div>
        <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto scrollbar-hide">
          {fechasSugeridas.map((fecha, idx) => (
            <button key={idx} onClick={() => onConfirm(fecha)} className={`w-full flex items-center justify-between p-5 border-2 rounded-[2.2rem] transition-all group active:scale-95 ${etiquetas[idx]?.style}`}>
              <div className="text-left">
                <p className={`text-[11px] font-black uppercase italic ${etiquetas[idx]?.iconColor}`}>{etiquetas[idx]?.label}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-black italic uppercase">{dayjs(fecha).format('dddd DD')}</div>
                  <span className="text-[10px] font-bold text-slate-700 uppercase">{dayjs(fecha).format('MMMM')}</span>
                </div>
              </div>
              <ArrowIcon size={18} className="text-slate-300 group-hover:translate-x-1" />
            </button>
          ))}
        </div>
        <button onClick={onClose} className="w-full py-6 bg-slate-50 text-slate-400 font-black uppercase text-[9px] tracking-[0.4em]">CANCELAR</button>
      </div>
    </div>
  );
};

const MyRegistrations = () => {
  const { user, userId } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const [pendingPayment, setPendingPayment] = useState(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedDebtForPay, setSelectedDebtForPay] = useState(null);
  const [renovacionModal, setRenovacionModal] = useState({ open: false, pkgId: null, fechasSugeridas: null });

  const formatTimeSafe = useCallback((timeStr) => {
    if (!timeStr) return "--:--";
    if (timeStr.includes('T')) return timeStr.split('T')[1].substring(0, 5);
    return String(timeStr).substring(0, 5);
  }, []);

  const fetchInitialData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const [resI, resC] = await Promise.all([
        apiFetch.get(`/inscripciones/alumno/${userId}`),
        apiFetch.get(API_ROUTES.CUENTAS_POR_COBRAR.HISTORIAL(userId))
      ]);
      const dataI = await resI.json();
      const dataC = await resC.json();

      if (resI.ok) setRegistrations(dataI.data || []);
      if (resC.ok) {
        const deuda = dataC.data?.find(c =>
          c.alumno_id == userId && (c.estado === 'PENDIENTE' || c.estado === 'PARCIAL')
        );
        setPendingPayment(deuda);
      }
    } catch (error) { toast.error("Error de sincronización"); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

  const handleOpenPayment = (debt) => {
    setSelectedDebtForPay(debt);
    setIsPayModalOpen(true);
  };

  const handlePrepaymentGroup = async (pkgId) => {
    const toastId = toast.loading("Consultando slots...");
    try {
      const res = await apiFetch.get(API_ROUTES.CUENTAS_POR_COBRAR.SUGERIR_FECHA(pkgId));
      const data = await res.json();
      toast.dismiss(toastId);
      if (res.ok) setRenovacionModal({ open: true, pkgId, fechasSugeridas: data.fechaSugerida });
    } catch (error) { toast.dismiss(toastId); toast.error("Error"); }
  };

  const confirmarRenovacionMasiva = async (fechaInicio) => {
    const { pkgId } = renovacionModal;
    setRenovacionModal({ open: false, pkgId: null, fechasSugeridas: null });
    const toastId = toast.loading("Sincronizando renovación...");
    try {
      const res = await apiFetch.post(API_ROUTES.CUENTAS_POR_COBRAR.GENERAR_ADELANTADO(pkgId), { fecha_inicio: fechaInicio });
      if (res.ok) { toast.success("¡Renovado! Paga para activar."); fetchInitialData(); }
      else { const r = await res.json(); toast.error(r.error || "Error"); }
    } catch (error) { toast.error("Error de red"); } finally { toast.dismiss(toastId); }
  };

  const handleAction = async (reg) => {
    const isPending = reg.estado === 'PENDIENTE_PAGO';
    const result = await Swal.fire({
      title: `<span class="italic font-black uppercase text-[#1e3a8a] text-sm">${isPending ? '¿BORRAR RESERVA?' : '¿FINALIZAR HORARIO?'}</span>`,
      text: 'Se liberará el cupo en este horario.',
      showCancelButton: true,
      confirmButtonColor: '#1e3a8a',
      confirmButtonText: 'CONFIRMAR',
      customClass: { popup: 'rounded-[2rem]' }
    });
    if (result.isConfirmed) {
      try {
        const endpoint = isPending ? `/inscripciones/${reg.id}/cancelar-reserva` : `/inscripciones/${reg.id}/separar-finalizar`;
        const res = await apiFetch.patch(endpoint);
        if (res.ok) { toast.success("Actualizado"); fetchInitialData(); }
      } catch (error) { toast.error("Error"); }
    }
  };

  const { currentPackages, historyItems } = useMemo(() => {
    const packages = {};
    const history = [];
    registrations.forEach(reg => {
      const isHistory = !reg.id_grupo_transaccion || ['FINALIZADO', 'PEN-RECU'].includes(reg.estado);
      if (isHistory) history.push(reg);
      else {
        const gid = reg.id_grupo_transaccion;
        if (!packages[gid]) packages[gid] = { id: gid, fecha_inicio: reg.fecha_inscripcion, items: [] };
        packages[gid].items.push(reg);
      }
    });
    return { currentPackages: Object.values(packages), historyItems: history };
  }, [registrations]);

  // 🚀 ESTADO DE CARGA MEJORADO
  if (loading) return (
    <div className="flex flex-col h-screen items-center justify-center bg-[#f8fafc] gap-4">
      <Loader2 className="animate-spin text-orange-500" size={48} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1e3a8a] animate-pulse">Sincronizando tus clases...</p>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#f8fafc]">

      {/* 🛡️ BANNER DE DEUDA ULTRA EVIDENTE (STICKY) */}
      {pendingPayment && (
        <div className="w-full bg-slate-900 py-4 border-b-4 border-orange-500 shadow-2xl sticky top-0 z-[100] animate-in slide-in-from-top duration-500">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-orange-500 p-1.5 rounded-lg animate-pulse">
                <AlertTriangle size={18} className="text-white" />
              </div>
              <p className="text-[11px] font-black text-orange-500 uppercase italic tracking-[0.3em]">Acción Requerida: Regularizar Pago</p>
            </div>
            <OutstandingDebtAlert pendingPayment={pendingPayment} onRefresh={fetchInitialData} onPay={handleOpenPayment} />
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto p-4 md:p-8 pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10 px-2">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-[#1e3a8a] uppercase italic tracking-tighter leading-none">MIS <span className="text-orange-500">CLASES</span></h2>
            <p className="text-[10px] font-black text-slate-400 uppercase mt-3 flex items-center gap-2 italic tracking-widest text-orange-600">
              <Dumbbell size={14} /> Atleta: {user?.user?.nombres}
            </p>
          </div>
          <div className="bg-white px-5 py-3 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <Trophy size={16} className="text-orange-500" />
            <div className="flex flex-col items-end">
              <p className="text-2xl font-black text-[#1e3a8a] italic leading-none">{currentPackages.length}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Paquetes Activos</p>
            </div>
          </div>
        </header>

        {/* 🌟 EMPTY STATE SUPERIOR (Si no hay clases activas) */}
        {currentPackages.length === 0 && (
          <div className="bg-white rounded-[3.5rem] border-2 border-dashed border-slate-200 p-8 md:p-16 text-center flex flex-col items-center justify-center min-h-[50vh] shadow-sm animate-in fade-in zoom-in-95 duration-700">
            <div className="w-24 h-24 bg-orange-50 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner">
              <CalendarSearch size={48} className="text-orange-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-3xl font-black text-[#1e3a8a] uppercase italic mb-3 tracking-tighter">¡Aún no estás en la cancha!</h3>
            <p className="text-slate-400 text-[12px] font-bold uppercase tracking-[0.2em] max-w-md mb-8 leading-relaxed">
              No tienes paquetes de clases activos en este momento. Dale play a tu entrenamiento y reserva tu horario.
            </p>
            <Link
              to="/dashboard/student/enrollment" // 👈 Asegúrate que esta ruta es la correcta
              className="bg-orange-500 text-white px-10 py-5 rounded-full font-black uppercase italic tracking-widest text-[12px] hover:bg-orange-600 hover:scale-105 transition-all shadow-xl shadow-orange-500/20 flex items-center gap-3 active:scale-95 group"
            >
              <Rocket size={18} fill="currentColor" className="group-hover:-translate-y-1 transition-transform" />
              Matricularme Ahora
            </Link>
          </div>
        )}

        {/* LISTA DE PAQUETES ACTIVOS */}
        <div className="space-y-12">
          {currentPackages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden group hover:shadow-2xl transition-shadow duration-500">
              <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-8">
                <div className="flex items-center gap-3">
                  <Receipt size={16} className="text-orange-500" />
                  <span className="text-[11px] font-black text-[#1e3a8a] uppercase italic tracking-tighter">CONTRATO: {pkg.id.slice(0, 10)}...</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
                    <Calendar size={12} className="text-blue-500" />
                    Inicio: {dayjs(pkg.fecha_inicio).add(5, 'hour').format('DD MMM, YYYY')}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2 mt-1">
                    <Calendar size={12} className="text-blue-500" />
                    Fin: {dayjs(pkg.fecha_inicio).add(29, 'day').add(5, 'hour').format('DD MMM, YYYY')}
                  </span>
                </div>
              </div>

              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
                {pkg.items.map((reg) => (
                  <div key={reg.id} className="bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:border-blue-300 hover:bg-blue-50/30 transition-all flex flex-col gap-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white to-transparent opacity-50 pointer-events-none"></div>
                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-[1.2rem] bg-[#1e3a8a] flex items-center justify-center text-white shadow-lg"><Calendar size={24} /></div>
                        <div>
                          <h4 className="text-2xl font-black text-[#1e3a8a] uppercase italic leading-none">{DIAS_NOMBRES[reg.horarios_clases?.dia_semana]}</h4>
                          <p className="text-[11px] font-bold text-slate-500 mt-2 flex items-center gap-1.5 uppercase bg-white w-fit px-2 py-0.5 rounded-md border border-slate-200">
                            <Clock size={12} className="text-orange-500" /> {formatTimeSafe(reg.horarios_clases?.hora_inicio)} - {formatTimeSafe(reg.horarios_clases?.hora_fin)}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${reg.estado === 'ACTIVO' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-orange-100 text-orange-700 border border-orange-200'}`}>
                        {reg.estado}
                      </span>
                    </div>

                    <div className="flex flex-col gap-3 pt-4 border-t border-slate-200/60 relative z-10">
                      <div className="flex items-center gap-2 text-slate-500 bg-white px-3 py-2 rounded-xl border border-slate-100">
                        <MapPin size={14} className="text-orange-500 shrink-0" />
                        <span className="text-[10px] font-black uppercase italic truncate">{reg.horarios_clases?.canchas?.sedes?.nombre}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm">
                          <Activity size={12} className="text-blue-500" />
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{reg.horarios_clases?.niveles_entrenamiento?.nombre}</span>
                        </div>
                        <button onClick={() => handleAction(reg)} className="p-3 text-rose-500 bg-white border border-rose-100 hover:bg-rose-500 hover:text-white rounded-xl transition-all active:scale-90 shadow-sm hover:shadow-rose-500/30">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-slate-50/80 flex justify-center border-t border-slate-100">
                <button onClick={() => handlePrepaymentGroup(pkg.id)} className="w-full max-w-md py-4 bg-[#1e3a8a] text-white rounded-2xl text-[11px] font-black uppercase italic hover:bg-orange-500 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 active:scale-95">
                  <Zap size={16} fill="white" /> Renovar Paquete Completo
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* HISTORIAL SEGMENTADO */}
        {historyItems.length > 0 && (
          <div className="mt-20 bg-slate-50/80 rounded-[3.5rem] p-6 md:p-10 border-2 border-dashed border-slate-200 transition-all hover:border-slate-300">
            <button onClick={() => setShowHistory(!showHistory)} className="flex items-center justify-between w-full text-[#1e3a8a] group transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors duration-300"><History size={22} /></div>
                <div className="text-left">
                  <span className="block text-[14px] font-black uppercase tracking-[0.2em] italic">Expediente Histórico</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{historyItems.length} registros pasados</span>
                </div>
              </div>
              <div className={`p-2 bg-white rounded-full shadow-sm border border-slate-100 transition-transform duration-500 ${showHistory ? 'rotate-180 bg-slate-100' : ''}`}>
                <ChevronDown size={24} className="text-slate-400" />
              </div>
            </button>

            {showHistory && (
              <div className="mt-10 space-y-3 animate-in slide-in-from-top-4 duration-500">
                {historyItems.map(item => (
                  <div key={item.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group/h hover:bg-[#1e3a8a] transition-all duration-300 shadow-sm hover:shadow-xl">
                    <div className="flex items-center gap-4 md:gap-8 pl-2">
                      <span className="text-[13px] font-black text-[#1e3a8a] italic w-28 group-hover:text-orange-500 transition-colors">{DIAS_NOMBRES[item.horarios_clases?.dia_semana]}</span>
                      <div className="hidden md:block h-6 w-[2px] bg-slate-100 group-hover:bg-slate-700 transition-colors"></div>
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold group-hover:text-slate-300 transition-colors bg-slate-50 group-hover:bg-slate-800 px-3 py-1.5 rounded-lg">
                        <Clock size={12} className="text-orange-500 group-hover:text-white" />
                        <span>{formatTimeSafe(item.horarios_clases?.hora_inicio)} - {formatTimeSafe(item.horarios_clases?.hora_fin)}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 border-2 border-slate-100 px-4 py-2 rounded-xl group-hover:border-slate-700 group-hover:text-slate-300 uppercase italic transition-colors">
                      {item.estado}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALES SUPERIORES */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-[1000]">
          <ReportPaymentModal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} debt={selectedDebtForPay} onSuccess={() => { setIsPayModalOpen(false); fetchInitialData(); }} />
        </div>
      )}
      <RenovacionModal isOpen={renovacionModal.open} fechasSugeridas={renovacionModal.fechasSugeridas} onClose={() => setRenovacionModal({ open: false, pkgId: null, fechasSugeridas: null })} onConfirm={confirmarRenovacionMasiva} />
    </div>
  );
};

export default MyRegistrations;