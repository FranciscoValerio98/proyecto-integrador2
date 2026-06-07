import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, CreditCard, User, 
  Menu, X, Activity, Ticket, LogOut, 
  Megaphone, UserPlus, Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from "../interceptors/api";
import { API_ROUTES } from "../constants/apiRoutes";
import Cookies from "js-cookie";

const MobileNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasNewNews, setHasNewNews] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Sincronización de Alerta de Noticias
  useEffect(() => {
    const checkNewsAlert = async () => {
      try {
        const response = await apiFetch.get(API_ROUTES.PUBLICACIONES.BASE);
        const result = await response.json();
        if (result.data && result.data.length > 0) {
          const newestId = String(result.data[0].id);
          const viewedId = Cookies.get('last_viewed_news');
          if (viewedId !== newestId) setHasNewNews(true);
        }
      } catch (e) {
        console.error("Error al verificar noticias:", e);
      }
    };

    checkNewsAlert();
    const handleNewsRead = () => setHasNewNews(false);
    window.addEventListener('news_read', handleNewsRead);
    return () => window.removeEventListener('news_read', handleNewsRead);
  }, []);

  return (
    <>
      {/* PANEL LATERAL FLOTANTE (MENÚ EXTENDIDO) */}
      <div className={`fixed inset-0 z-[60] transition-all duration-300 ${isMenuOpen ? 'visible' : 'invisible'}`}>
        {/* Fondo oscuro borroso */}
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={toggleMenu}
        ></div>
        
        {/* Contenedor del Menú */}
        <div className={`absolute right-0 top-0 h-full w-[280px] bg-gradient-to-b from-[#1e3a8a] to-[#0f172a] shadow-2xl transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full">
            
            {/* Botón Cerrar (X) */}
            <button onClick={toggleMenu} className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 p-2 rounded-full">
              <X size={20} />
            </button>

            {/* HEADER CON LOGO CIRCULAR */}
            <div className="flex-none pt-12 pb-6 px-4 flex flex-col items-center border-b border-white/10 bg-white/5">
              <div className="relative z-10 w-[120px] aspect-square bg-white rounded-full p-2.5 shadow-2xl flex items-center justify-center border-[4px] border-white/10 overflow-hidden mb-3">
                <Link to="/" onClick={toggleMenu}>
                  <img src="/Logo con borde blanco.png" alt="Logo Club Gema" className="w-full h-full object-cover" />
                </Link>
              </div>
              <div className="text-center">
                <span className="block font-black text-xl tracking-tighter uppercase italic text-white leading-none">
                  Gema<span className="text-orange-500">Student</span>
                </span>
              </div>
            </div>

            {/* 🌟 BOTÓN DE ACCIÓN PRINCIPAL DENTRO DEL MENÚ */}
            <div className="px-5 pb-6 pt-5 border-b border-white/10">
              <Link 
                to="/dashboard/student/enrollment" 
                onClick={toggleMenu}
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.4)] active:scale-95 transition-transform"
              >
                <UserPlus size={18} />
                <span className="text-[12px] font-black uppercase tracking-widest italic">Nueva Matrícula</span>
              </Link>
            </div>

            {/* NAVEGACIÓN EXTENDIDA */}
            <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto [scrollbar-width:none]">
              
              {/* Grupo Principal */}
              <div className="space-y-2">
                <p className="text-[9px] font-black text-blue-300/40 uppercase tracking-[0.3em] ml-2 mb-3">Principal</p>
                
                <NavLink to="/dashboard/student/myRegistrations" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 hover:text-white py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors font-bold text-[13px] uppercase tracking-wide">
                  <Calendar size={18} className="text-blue-400"/> Mis Inscripciones
                </NavLink>
                
                <NavLink to="/dashboard/student/news" onClick={toggleMenu} className="flex items-center justify-between text-blue-100/70 hover:text-white py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors font-bold text-[13px] uppercase tracking-wide">
                  <div className="flex items-center gap-4">
                    <Megaphone size={18}/> Muro de Noticias
                  </div>
                  {hasNewNews && (
                    <div className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]"></span>
                    </div>
                  )}
                </NavLink>
              </div>

              {/* Grupo Rendimiento */}
              <div className="space-y-2">
                <p className="text-[9px] font-black text-blue-300/40 uppercase tracking-[0.3em] ml-2 mb-3">Salud y Rendimiento</p>
                <NavLink to="/dashboard/student/injuries" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 hover:text-white py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors font-bold text-[13px] uppercase tracking-wide">
                  <Activity size={18}/> Mis Lesiones
                </NavLink>
                <NavLink to="/dashboard/student/recoveries" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 hover:text-white py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors font-bold text-[13px] uppercase tracking-wide">
                  <Ticket size={18}/> Recuperaciones
                </NavLink>
              </div>

              {/* Grupo Administración */}
              <div className="space-y-2 pb-6">
                <p className="text-[9px] font-black text-blue-300/40 uppercase tracking-[0.3em] ml-2 mb-3">Administración</p>
                <NavLink to="/dashboard/student/payments" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 hover:text-white py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors font-bold text-[13px] uppercase tracking-wide">
                  <CreditCard size={18}/> Mis Pagos
                </NavLink>
                <NavLink to="/dashboard/student/profile" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 hover:text-white py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors font-bold text-[13px] uppercase tracking-wide">
                  <User size={18}/> Mi Perfil
                </NavLink>
              </div>
            </nav>

            {/* FOOTER: CERRAR SESIÓN */}
            <div className="flex-none p-4 bg-black/20 border-t border-white/10">
              <button onClick={logout} className="w-full flex items-center justify-center gap-3 py-3 text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-xl transition-colors font-black uppercase italic text-[11px] tracking-widest">
                <LogOut size={16}/> Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 NAVBAR INFERIOR (Las 4 acciones definitivas) */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0f172a] border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-50 md:hidden transition-all pb-safe">
        <div className="flex justify-around items-end h-[72px] px-2 pb-2">
          
          <NavLink to="/dashboard/student" end className={({ isActive }) => `flex flex-col items-center gap-1.5 w-full transition-all ${isActive ? 'text-orange-500' : 'text-blue-100/50'}`}>
            <LayoutDashboard size={20} className={location.pathname === '/dashboard/student' ? 'animate-bounce-short' : ''} />
            <span className="text-[8px] uppercase font-black italic tracking-widest">Inicio</span>
          </NavLink>

          {/* ACCIÓN CLAVE 1: GESTIÓN DE CLASES */}
          <NavLink to="/dashboard/student/myRegistrations" className={({ isActive }) => `flex flex-col items-center gap-1.5 w-full transition-all ${isActive ? 'text-blue-400' : 'text-blue-100/50'}`}>
            <Calendar size={20} />
            <span className="text-[8px] uppercase font-black italic tracking-widest">INSCRIPCIONES</span>
          </NavLink>

          {/* 🌟 ACCIÓN CLAVE 2: NUEVA COMPRA (DESTACADO EN EL CENTRO) */}
          <NavLink to="/dashboard/student/enrollment" className={({ isActive }) => `flex flex-col items-center gap-1.5 w-full transition-all relative top-[-8px] ${isActive ? 'text-orange-400' : 'text-orange-500'}`}>
            <div className={`p-3 rounded-full shadow-lg ${location.pathname === '/dashboard/student/enrollment' ? 'bg-orange-600 shadow-orange-500/50' : 'bg-orange-500 shadow-orange-500/30'}`}>
               <UserPlus size={22} className="text-white" />
            </div>
            <span className="text-[8px] text-orange-500 uppercase font-black italic tracking-widest">Matricular</span>
          </NavLink>

          <button onClick={toggleMenu} className="flex flex-col items-center gap-1.5 w-full text-blue-100/50 relative">
            <Menu size={20} />
            <span className="text-[8px] uppercase font-black italic tracking-widest">Menú</span>
            {hasNewNews && (
              <span className="absolute top-0 right-1/4 flex h-2 w-2 rounded-full bg-orange-500 border border-[#0f172a]"></span>
            )}
          </button>

        </div>
      </nav>
    </>
  );
};

export default MobileNavbar;