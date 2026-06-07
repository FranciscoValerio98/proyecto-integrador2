import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../interceptors/api';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Send, ArrowLeft, Building2, ChevronLeft, ChevronRight, Zap, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_ROUTES } from '../../constants/apiRoutes';

import StudentEnrollmentGroup from '../../components/student/StudentEnrollmentGroup';
import OutstandingDebtAlert from '../../components/student/OutstandingDebtAlert';
import WeeklyTimeline from '../../components/student/WeeklyTimelineEnrollment';
import EnrollmentDateModal from '../../components/student/EnrollmentDateModal';
import ReportPaymentModal from "../../components/student/Payments/ReportPaymentModal";

const Enrollment = () => {
  const { userId } = useAuth();
  const scrollRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [horarios, setHorarios] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [incluyeCamiseta, setIncluyeCamiseta] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [activeSede, setActiveSede] = useState(null);
  const [previewModal, setPreviewModal] = useState({ open: false, data: null });

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedDebtForPay, setSelectedDebtForPay] = useState(null);

  useEffect(() => { if (userId) fetchInitialData(); }, [userId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [resH, resC] = await Promise.all([
        apiFetch.get(API_ROUTES.HORARIOS.BASE),
        apiFetch.get(API_ROUTES.CUENTAS_POR_COBRAR.HISTORIAL(userId))
      ]);
      const dataH = await resH.json();
      const dataC = await resC.json();

      if (resH.ok) {
        const activos = dataH.data?.filter(h => h.activo) || [];
        setHorarios(activos);
        if (activos.length > 0) {
          const sedesUnicas = [...new Set(activos.map(h => h.cancha?.sede?.nombre))].sort();
          setActiveSede(prev => prev || sedesUnicas[0]);
        }
      }
      if (resC.ok) {
        const deuda = dataC.data?.find(c => 
          c.alumno_id == userId && (c.estado === 'PENDIENTE' || c.estado === 'PARCIAL')
        );
        setPendingPayment(deuda);
      }
    } catch (e) { 
      toast.error("Error de sincronización Gema"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleOpenPayment = (debt) => {
    setSelectedDebtForPay(debt);
    setIsPayModalOpen(true);
  };

  const scroll = (direction) => {
    const { current } = scrollRef;
    current.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  const sedesDisponibles = useMemo(() => [...new Set(horarios.map(h => h.cancha?.sede?.nombre))].sort(), [horarios]);
  const agendaSeleccionada = useMemo(() => horarios.filter(h => selectedIds.includes(h.id)), [horarios, selectedIds]);
  
  const resumenMatricula = useMemo(() => {
    const resumen = {};
    const days = ["", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM"];
    agendaSeleccionada.forEach(h => {
      const sede = h.cancha?.sede?.nombre;
      if (!resumen[sede]) resumen[sede] = [];
      resumen[sede].push(days[h.dia_semana]);
    });
    return resumen;
  }, [agendaSeleccionada]);

  const gruposDeSedeActiva = useMemo(() => {
    if (!activeSede) return [];
    const grupos = {};
    horarios.filter(h => h.cancha?.sede?.nombre === activeSede).forEach(h => {
      const nivel = h.nivel?.nombre || "General";
      const bloque = `${h.hora_inicio.slice(0, 5)} - ${h.hora_fin.slice(0, 5)}`;
      const key = `${activeSede}-${nivel}-${bloque}`;
      if (!grupos[key]) grupos[key] = { key, nivel, hora: bloque, cancha: h.cancha?.nombre, opciones: [] };
      grupos[key].opciones.push(h);
    });
    return Object.values(grupos);
  }, [horarios, activeSede]);

  const toggleSelection = (id) => {
    const claseNueva = horarios.find(h => h.id === id);
    if (!selectedIds.includes(id)) {
      const choque = agendaSeleccionada.find(h => 
        h.dia_semana === claseNueva.dia_semana && (
          (claseNueva.hora_inicio >= h.hora_inicio && claseNueva.hora_inicio < h.hora_fin) ||
          (claseNueva.hora_fin > h.hora_inicio && claseNueva.hora_fin <= h.hora_fin)
        )
      );
      if (choque) return toast.error("¡Cruce detectado!");
    }
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const iniciarProcesoMatricula = async () => {
    if (selectedIds.length === 0) return toast.error("Selecciona tus clases");
    setSubmitting(true);
    try {
      // 🚩 CAMBIO AQUÍ: Ahora enviamos el userId y los selectedIds para la lógica de enganche
      const response = await apiFetch.post(API_ROUTES.ASISTENCIAS.PREVISUALIZAR, { 
        alumno_id: userId,
        horario_ids: selectedIds 
      });
      const result = await response.json();
      if (response.ok) setPreviewModal({ open: true, data: result.data });
      else toast.error(result.message);
    } catch (e) { toast.error("Error de conexión"); } finally { setSubmitting(false); }
  };

  const confirmarMatriculaFinal = async (fechaElectiva) => {
    setPreviewModal({ open: false, data: null });
    setSubmitting(true);
    try {
      const response = await apiFetch.post(API_ROUTES.INSCRIPCIONES.BASE, {
        alumno_id: userId,
        horario_ids: selectedIds,
        fecha_inicio_electiva: fechaElectiva,
        incluye_camiseta: incluyeCamiseta
      });
      if (response.ok) {
        toast.success("¡Reserva generada!");
        await fetchInitialData();
        setSelectedIds([]);
        setIncluyeCamiseta(false);
      } else {
        const result = await response.json();
        // Aquí puedes capturar el throw new Error del backend si está "ACTIVO"
        toast.error(result.message || "Error al procesar");
      }
    } catch (error) { toast.error("Error de servidor"); } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#1e3a8a]" size={48} />
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#f8fafc]">
      
      {/* 🚨 ZONA DE ALERTA CRÍTICA (BANNER SUPERIOR STICKY) */}
      {pendingPayment && (
        <div className="w-full bg-slate-900 py-4 border-b-4 border-orange-500 shadow-2xl sticky top-0 z-[200] animate-in slide-in-from-top duration-500">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-orange-500 p-1.5 rounded-lg animate-pulse">
                <AlertTriangle size={18} className="text-white" />
              </div>
              <p className="text-[11px] font-black text-orange-500 uppercase italic tracking-[0.3em]">Acción Administrativa Requerida</p>
            </div>
            <OutstandingDebtAlert 
              pendingPayment={pendingPayment} 
              onRefresh={fetchInitialData}
              onPay={handleOpenPayment} 
            />
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="px-4 md:px-8 transition-all duration-700">
        <div className="max-w-6xl mx-auto py-8">
          <header className="mb-8">
            <Link to="/dashboard/student" className="inline-flex items-center gap-1 text-slate-400 hover:text-[#1e3a8a] mb-4 text-[10px] font-black uppercase italic tracking-widest transition-colors">
              <ArrowLeft size={12} /> Dashboard
            </Link>
            <h1 className="text-4xl md:text-6xl font-black text-[#1e3a8a] italic uppercase tracking-tighter leading-none">
              Matrícula <span className="text-orange-500">Gema</span>
            </h1>
          </header>

          {/* SEDES */}
          <div className="relative mb-12 group">
            <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-full shadow-xl hidden md:group-hover:flex hover:bg-[#1e3a8a] hover:text-white transition-all -ml-6 border border-slate-100">
              <ChevronLeft size={20} />
            </button>
            <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide py-4 px-2 scroll-smooth">
              {sedesDisponibles.map(sede => (
                <button key={sede} onClick={() => setActiveSede(sede)} className={`px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase italic transition-all duration-500 border-2 flex-shrink-0 ${activeSede === sede ? 'bg-[#1e3a8a] border-[#1e3a8a] text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}>
                  <Building2 size={16} /> {sede}
                </button>
              ))}
            </div>
            <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-full shadow-xl hidden md:group-hover:flex hover:bg-[#1e3a8a] hover:text-white transition-all -mr-6 border border-slate-100">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* LISTADO DE GRUPOS */}
          <div className="space-y-6 mb-12">
            {gruposDeSedeActiva.map((grupo) => (
              <StudentEnrollmentGroup key={grupo.key} group={grupo} selectedIds={selectedIds} onToggle={toggleSelection} />
            ))}
          </div>

          <WeeklyTimeline agendaSeleccionada={agendaSeleccionada} />
        </div>
      </div>

      {/* FOOTER FLOTANTE SELECCIÓN */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 inset-x-0 flex flex-col items-center z-[150] px-4 pointer-events-none">
          <label className="pointer-events-auto flex items-center gap-4 bg-[#0f172a] text-white px-6 py-3.5 rounded-[1.8rem] mb-3 border-2 border-white/20 shadow-2xl cursor-pointer hover:bg-slate-900 transition-all active:scale-95 group">
            <input type="checkbox" checked={incluyeCamiseta} onChange={(e) => setIncluyeCamiseta(e.target.checked)} className="w-5 h-5 accent-orange-500" />
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase italic leading-none group-hover:text-orange-400">¡Quiero mi camiseta!</span>
              <span className="text-[8px] font-bold text-blue-300 uppercase mt-1">+ S/ 50.00 ADICIONALES</span>
            </div>
          </label>

          <div className="bg-[#1e3a8a] text-white p-4 rounded-[2rem] shadow-2xl border-4 border-white mb-3 pointer-events-auto flex gap-4 items-center w-full max-w-md animate-fade-in-up">
            <div className="bg-orange-500 p-2.5 rounded-xl shrink-0"><Zap size={20} fill="white" /></div>
            <div className="flex flex-1 gap-3 overflow-hidden divide-x divide-white/10">
              {Object.entries(resumenMatricula).map(([sede, dias]) => (
                <div key={sede} className="pl-3 first:pl-0 truncate">
                  <p className="text-[8px] font-black uppercase text-blue-300">{sede}</p>
                  <p className="text-[11px] font-black italic uppercase leading-none">{dias.join('+')}</p>
                </div>
              ))}
            </div>
            <div className="pl-3 border-l border-white/10 text-center shrink-0">
              <p className="text-[8px] font-black uppercase text-orange-400">Total</p>
              <p className="text-xl font-black italic leading-none">{selectedIds.length}</p>
            </div>
          </div>

          <button
            onClick={iniciarProcesoMatricula}
            disabled={submitting}
            className="pointer-events-auto flex items-center justify-center gap-4 px-12 py-5 rounded-full font-black uppercase italic transition-all duration-500 shadow-2xl bg-orange-500 text-white hover:scale-105 active:scale-95 border-4 border-white w-full max-w-sm"
          >
            {submitting ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
            <span className="tracking-widest text-[12px]">Finalizar Selección</span>
          </button>
        </div>
      )}

      {/* MODAL DE PAGO (Z-INDEX 1000) */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-[1000]">
          <ReportPaymentModal 
            isOpen={isPayModalOpen} 
            onClose={() => setIsPayModalOpen(false)} 
            debt={selectedDebtForPay} 
            onSuccess={() => { setIsPayModalOpen(false); fetchInitialData(); }} 
          />
        </div>
      )}

      {/* MODALES DE SOPORTE */}
      <EnrollmentDateModal 
        isOpen={previewModal.open} 
        previewData={previewModal.data} 
        onClose={() => setPreviewModal({ open: false, data: null })} 
        onConfirm={confirmarMatriculaFinal} 
      />
    </div>
  );
};

export default Enrollment;