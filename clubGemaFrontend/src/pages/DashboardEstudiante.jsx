import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar, Filter, Loader2, Sparkles,
  ChevronRight, ChevronLeft, RefreshCcw,
  Users, Gift, HeartPulse, BellOff, Zap, Star, Trophy, Eye, EyeOff
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../interceptors/api";
import { API_ROUTES } from "../constants/apiRoutes";

import StudentSchedule from "../components/student/StudentSchedule";
import StudentPayments from "../components/student/StudentPayments";
import MonthlyCalendarDashboard from "../components/student/MonthlyCalendarDashboard";
import NotificationBell from "../components/student/Notifications/NotificationBell";

// 🎨 Mapeo de Iconos: Convierte el texto de la DB en el componente visual
const IconMap = {
  RefreshCcw: <RefreshCcw size={24} />,
  Users: <Users size={24} />,
  HeartPulse: <HeartPulse size={24} />,
  Gift: <Gift size={24} />,
  Sparkles: <Sparkles size={24} />,
  Zap: <Zap size={24} />,
  Star: <Star size={24} />,
  Trophy: <Trophy size={24} />
};

// --- COMPONENTE CARRUSEL DINÁMICO ---
const StudentAnnouncements = ({ anuncios = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!anuncios || anuncios.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === anuncios.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, [anuncios, currentIndex]);

  if (!anuncios || anuncios.length === 0) return null;

  const item = anuncios[currentIndex];

  return (
    <div className="w-full mb-8">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Gift size={16} className="text-orange-500" />
        <h2 className="font-black uppercase tracking-widest text-[9px] italic text-slate-500">Beneficios Exclusivos Gema</h2>
      </div>

      <div 
        key={item.id} 
        className="relative overflow-hidden rounded-[2rem] shadow-xl shadow-blue-900/10 h-36 md:h-40 border border-white/50 animate-in fade-in slide-in-from-right-4 duration-700"
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${item.gradiente} transition-all duration-1000`}></div>

        <div className="relative z-10 p-5 text-white flex flex-col justify-center h-full">
          <div className="flex justify-between items-start w-full">
            <div className="flex-1 pr-4">
               <span className="text-[8px] font-black bg-white/20 px-2 py-1 rounded-md mb-2 inline-block tracking-widest uppercase">
                 {item.badge}
               </span>
               <h3 className="text-xl md:text-2xl font-black italic uppercase leading-none mb-1.5 tracking-tighter drop-shadow-md">
                 {item.titulo}
               </h3>
               <p className="text-[10px] md:text-xs font-medium opacity-90 leading-snug line-clamp-2">
                 {item.descripcion}
               </p>
            </div>
            
            <div className="flex flex-col gap-2 shrink-0 relative">
               {anuncios.length > 1 && (
                 <div className="flex gap-1 mb-2">
                   <button onClick={(e) => { e.stopPropagation(); setCurrentIndex(currentIndex === 0 ? anuncios.length - 1 : currentIndex - 1); }} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors">
                      <ChevronLeft size={14} />
                   </button>
                   <button onClick={(e) => { e.stopPropagation(); setCurrentIndex(currentIndex === anuncios.length - 1 ? 0 : currentIndex + 1); }} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors">
                      <ChevronRight size={14} />
                   </button>
                 </div>
               )}
               <div className="opacity-20 flex justify-end scale-[2.5] origin-right pointer-events-none">
                  {IconMap[item.icono] || <Gift size={24} />}
               </div>
            </div>
          </div>
        </div>

        {anuncios.length > 1 && (
          <div className="absolute bottom-0 left-0 h-1 bg-black/20 w-full">
            <div 
              key={`progress-${currentIndex}`}
              className="h-full bg-white/60 transition-all ease-linear"
              style={{ animation: 'progress-animation 6000ms linear forwards' }}
            />
          </div>
        )}
      </div>

      <style>{`@keyframes progress-animation { from { width: 0%; } to { width: 100%; } }`}</style>
    </div>
  );
};

// --- DASHBOARD PRINCIPAL ---
const DashboardEstudiante = () => {
  const { user, userId } = useAuth();

  const [attendance, setAttendance] = useState([]);
  const [debts, setDebts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🚩 ESTADO PARA CONTROLAR EL CALENDARIO MENSUAL
  const [showCalendar, setShowCalendar] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [showNotifList, setShowNotifList] = useState(false);
  const [unreadCountDB, setUnreadCountDB] = useState(0);

  const [filtroMes, setFiltroMes] = useState("TODOS");
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear().toString());
  
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  
  // 🚩 Opciones dinámicas para el año (Año anterior, actual, próximo)
  const aniosOpciones = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [(currentYear - 1).toString(), currentYear.toString(), (currentYear + 1).toString()];
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await apiFetch.get(API_ROUTES.NOTIFICACIONES?.BASE || "/notificaciones");
      const result = await res.json();
      if (result.success && result.data) setNotifications(result.data);
      
      const resCount = await apiFetch.get((API_ROUTES.NOTIFICACIONES?.BASE || "/notificaciones") + "/conteo-no-leidas");
      const countResult = await resCount.json();
      if (countResult.success) setUnreadCountDB(countResult.data || 0);
    } catch (error) { console.error("Error notificaciones:", error); }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // 🛡️ CHALECO ANTIBALAS: Función segura que evita el error "Unexpected token '<'"
        const fetchSafe = async (url) => {
          try {
            const res = await apiFetch.get(url);
            // Si la respuesta no es 200 OK (ej. 404), no intentamos parsear HTML
            if (!res.ok) return { data: [] }; 
            return await res.json();
          } catch (error) {
            // Si el servidor se cae por completo, devolvemos data vacía
            return { data: [] }; 
          }
        };

        // Pedimos todo en paralelo usando nuestro fetch seguro
        const [dataAsist, dataRecu, dataDebts, dataPay, dataBen] = await Promise.all([
          fetchSafe(API_ROUTES.ASISTENCIAS.ALUMNO_HISTORIAL(userId)),
          // ⚠️ Revertido a HISTORIAL (El backend seguro lee el Token de aquí)
          fetchSafe(API_ROUTES.RECUPERACIONES.HISTORIAL), 
          fetchSafe(API_ROUTES.CUENTAS_POR_COBRAR.HISTORIAL(userId)),
          fetchSafe(API_ROUTES.PAGOS.ALUMNO_HISTORIAL(userId)),
          fetchSafe(API_ROUTES.ANUNCIOS_BENEFICIOS.ACTIVOS)
        ]);

        setAttendance([...(dataAsist.data || []), ...(dataRecu.data?.map(r => ({ ...r, isRecuperacion: true })) || [])]);
        setDebts(dataDebts.data || []);
        setPayments(dataPay.data || []);
        setBenefits(dataBen.data || []);
        
      } catch (error) {
        console.error("Error crítico en Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadDashboardData();
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 300000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const handleMarkAsRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, leido: true } : n));
    setUnreadCountDB(prev => Math.max(0, prev - 1));
    try {
      await apiFetch.patch((API_ROUTES.NOTIFICACIONES?.BASE || "/notificaciones") + `/${id}/leer`);
    } catch (error) { console.error(error); }
  };

  const firstName = user?.user?.nombres?.split(' ')[0] || "Campeón";
  const initial = firstName.charAt(0).toUpperCase();

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f1f5f9]">
      <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
      <p className="font-black text-[#1e3a8a] uppercase italic text-[10px] tracking-widest text-center animate-pulse">Sincronizando Club Gema...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex justify-center relative overflow-hidden">
      <div className="w-full max-w-lg md:max-w-6xl p-4 pb-28 relative z-10">

        {/* 1. HEADER MÓVIL OPTIMIZADO */}
        <header className="flex justify-between items-center mb-6 mt-2 relative">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#1e3a8a] tracking-tighter uppercase italic leading-none">
              Hola, <span className="text-orange-500">{firstName}</span> 👋
            </h1>
            <p className="text-[9px] md:text-xs text-slate-400 font-black mt-2 italic uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={12} className="text-orange-400" /> ¡Bienvenido al Club!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <NotificationBell count={unreadCountDB} onClick={() => setShowNotifList(!showNotifList)} />
              {showNotifList && (
                <div className="absolute right-0 top-14 w-[280px] md:w-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/80">
                    <h3 className="font-black text-[#1e3a8a] text-[10px] uppercase italic tracking-widest">Alertas</h3>
                    {unreadCountDB > 0 && <span className="text-[8px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-black tracking-widest">{unreadCountDB} NUEVAS</span>}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      <div className="flex flex-col">
                        {notifications.filter(n => !n.leido).map((n) => (
                          <div key={n.id} className="p-4 border-b border-slate-50 bg-white" onClick={() => handleMarkAsRead(n.id)}>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full mt-1 shrink-0 bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                              <div>
                                <h4 className="font-black text-[#1e3a8a] text-[11px] uppercase tracking-tight leading-none mb-1">{n.titulo}</h4>
                                <p className="text-[10px] text-slate-600 font-medium leading-snug">{n.mensaje}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center flex flex-col items-center gap-2">
                        <BellOff size={24} className="text-slate-300" />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Sin notificaciones</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-[#1e40af] to-[#0f172a] rounded-[1rem] flex items-center justify-center text-white font-black border-2 border-white shadow-lg text-lg">
              {initial}
            </div>
          </div>
        </header>

        {/* 2. CARRUSEL DINÁMICO */}
        <StudentAnnouncements anuncios={benefits} />

        {/* 3. CALENDARIO SEMANAL VISUAL (Con Botón Toggle) */}
        <div className="mb-8 relative z-0">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="font-black uppercase tracking-widest text-[9px] italic text-slate-500">Mi Agenda de la Semana</h2>
            <button 
              onClick={() => setShowCalendar(!showCalendar)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${showCalendar ? 'bg-orange-500 text-white' : 'bg-white text-[#1e3a8a] shadow-sm border border-slate-100'}`}
            >
              {showCalendar ? (
                <><EyeOff size={14} /> Ocultar Calendario</>
              ) : (
                <><Eye size={14} /> Ver Calendario Completo</>
              )}
            </button>
          </div>
          
          {/* Renderizado Condicional del Calendario */}
          {showCalendar && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <MonthlyCalendarDashboard />
            </div>
          )}
        </div>

        {/* 4. GRID: CLASES Y PAGOS (REORDENADO CON CSS ORDER) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* 🥇 SECCIÓN PAGOS: Aparece PRIMERO en celular (order-1), a la DERECHA en PC (lg:order-2) */}
          <div className="space-y-4 order-1 lg:order-2">
            <div className="bg-white p-5 rounded-[2rem] shadow-xl shadow-blue-900/5 border-2 border-white overflow-hidden relative">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-3 bg-orange-500 rounded-full"></div>
                <h2 className="font-black text-[#1e3a8a] uppercase tracking-widest italic text-[10px]">Mis Finanzas 💎</h2>
              </div>
              <StudentPayments debts={debts} payments={payments} />
            </div>
          </div>

          {/* 🥈 SECCIÓN CLASES: Aparece SEGUNDO en celular (order-2), a la IZQUIERDA en PC (lg:order-1) */}
          <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
            {/* Filtros Compactos con Menú de Año Mejorado */}
            <div className="flex items-center justify-between bg-white p-3 rounded-[1.5rem] border border-slate-100 shadow-sm flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <Filter size={12} className="text-orange-500" />
                <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} className="text-[9px] font-black uppercase tracking-widest text-[#1e3a8a] outline-none bg-transparent cursor-pointer">
                  <option value="TODOS">TODO EL AÑO</option>
                  {meses.map((mes, idx) => <option key={idx} value={idx.toString()}>{mes.toUpperCase()}</option>)}
                </select>
              </div>
              
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <Calendar size={12} className="text-blue-500" />
                <select value={filtroAnio} onChange={(e) => setFiltroAnio(e.target.value)} className="text-[9px] font-black uppercase tracking-widest text-slate-500 outline-none bg-transparent cursor-pointer">
                  {aniosOpciones.map(anio => <option key={anio} value={anio}>CICLO {anio}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-lg shadow-slate-200/50 overflow-hidden border border-slate-100">
               <StudentSchedule attendance={attendance} filtroMes={filtroMes} filtroAnio={filtroAnio} />
            </div>
          </div>

        </div>

        <p className="mt-12 text-center text-[8px] text-slate-300 font-black uppercase tracking-[0.4em] opacity-60 italic">
          CLUB GEMA | DESDE 2023
        </p>
      </div>
    </div>
  );
};

export default DashboardEstudiante;