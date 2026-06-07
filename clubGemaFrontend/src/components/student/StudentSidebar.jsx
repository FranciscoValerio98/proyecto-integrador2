import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, CreditCard, User, LogOut, Activity, Ticket,
  ChevronDown, LayoutDashboard, Megaphone, UserPlus, Calendar // Importación de Calendar para el nuevo icono
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../interceptors/api";
import Cookies from "js-cookie";
import { API_ROUTES } from "../../constants/apiRoutes";

const StudentSidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [hasNewNews, setHasNewNews] = useState(false);

  const [openMenus, setOpenMenus] = useState({
    'Salud y Rendimiento': false,
    'Administración': false
  });

  useEffect(() => {
    const checkNewsAlert = async () => {
      try {
        const response = await apiFetch.get(API_ROUTES.PUBLICACIONES.BASE);
        const result = await response.json();
        if (result.data && result.data.length > 0) {
          const newestId = String(result.data[0].id);
          const viewedId = Cookies.get('last_viewed_news');

          if (viewedId !== newestId) {
            setHasNewNews(true);
          }
        }
      } catch (e) {
        console.error("Error al verificar notificaciones:", e);
      }
    };

    checkNewsAlert();

    const handleNewsRead = () => setHasNewNews(false);
    window.addEventListener('news_read', handleNewsRead);

    return () => window.removeEventListener('news_read', handleNewsRead);
  }, []);

  const toggleMenu = (title) => {
    setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const menuGroups = [
    {
      title: "Inicio",
      type: "link",
      icon: LayoutDashboard,
      path: "/dashboard/student"
    },
    {
      title: "Mis Inscripciones", // 👈 Texto corregido para mayor claridad operativa
      type: "link",
      icon: Calendar, // 👈 Usamos el icono de Calendario para que se vea más profesional
      path: "/dashboard/student/myRegistrations"
    },
    {
      title: "Muro de Noticias",
      type: "link",
      icon: Megaphone,
      path: "/dashboard/student/news",
      hasAlert: hasNewNews
    },
    {
      title: "Salud y Rendimiento",
      type: "dropdown",
      items: [
        { icon: Activity, label: "Mis Lesiones", path: "/dashboard/student/injuries" },
        { icon: Ticket, label: "Mis Recuperaciones", path: "/dashboard/student/recoveries" },
      ]
    },
    {
      title: "Administración",
      type: "dropdown",
      items: [
        { icon: CreditCard, label: "Mis Pagos", path: "/dashboard/student/payments" },
        { icon: User, label: "Mi Perfil", path: "/dashboard/student/profile" },
      ]
    }
  ];

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-[#1e3a8a] to-[#0f172a] text-white h-screen fixed left-0 top-0 z-40 border-r border-white/10 shadow-2xl overflow-hidden">

        {/* HEADER LOGO */}
        <div className="flex-none pt-8 pb-6 px-4 flex flex-col items-center bg-white/5 relative">
          {/* 🌟 LOGO AHORA ES TOTALMENTE CIRCULAR */}
          <div className="relative z-10 w-[160px] aspect-square bg-white rounded-full p-3 shadow-2xl flex items-center justify-center border-[6px] border-white/10 overflow-hidden mb-4 hover:border-orange-500/20 transition-colors">
            <Link to="/" className="relative z-10 hover:scale-105 transition-transform duration-300">
              <img src="/Logo con borde blanco.png" alt="Logo Club Gema" className="w-full h-full object-cover" />
            </Link>
          </div>
          <div className="text-center">
            <span className="block font-black text-xl tracking-tighter uppercase italic text-white leading-none">
              Gema<span className="text-orange-500">Student</span>
            </span>
          </div>
        </div>

        {/* 🌟 BOTÓN DE ACCIÓN PRINCIPAL (BAJADO PARA QUE RESPIRE MEJOR) */}
        <div className="px-5 pb-8 pt-4 border-b border-white/10 relative z-20"> {/* pb-8 pt-4 para bajarlo */}
          <Link
            to="/dashboard/student/enrollment"
            className="group relative w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transition-all duration-300 active:scale-95 overflow-hidden"
          >
            {/* Efecto de brillo interior */}
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            
            <UserPlus size={20} className="relative z-10 group-hover:scale-110 transition-transform" />
            <span className="relative z-10 text-[13px] font-black uppercase tracking-widest italic">Nueva Matrícula</span>
          </Link>
        </div>

        {/* NAVEGACIÓN */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden text-left">
          <p className="px-4 text-[9px] font-black text-blue-300/40 uppercase tracking-[0.3em] mb-3">
            Menú Principal
          </p>

          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {group.type === 'link' ? (
                <Link
                  to={group.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group/link ${location.pathname === group.path
                    ? 'bg-blue-500/20 text-white shadow-inner border border-blue-400/20'
                    : 'text-blue-100/60 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <group.icon size={18} className={location.pathname === group.path ? 'text-blue-400' : 'group-hover/link:text-orange-400 transition-colors'} />
                    <span className="text-[12px] font-bold uppercase tracking-wider">{group.title}</span>
                  </div>

                  {/* ALERTA NOTICIAS (Ahora en el primer nivel) */}
                  {group.hasAlert && (
                    <div className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]"></span>
                    </div>
                  )}
                </Link>
              ) : (
                <div className="space-y-1 mt-2">
                  <button
                    onClick={() => toggleMenu(group.title)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-blue-100/40 hover:bg-white/5 hover:text-blue-100/80 transition-all group"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">{group.title}</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${openMenus[group.title] ? 'rotate-180' : ''}`} />
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ${openMenus[group.title] ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pl-4 space-y-1 mt-1 border-l-2 border-white/5 ml-4">
                      {group.items.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all text-[11px] font-bold uppercase tracking-wide ${isActive
                              ? 'text-orange-400 bg-orange-400/10'
                              : 'text-blue-100/50 hover:text-white hover:bg-white/5'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon size={14} />
                              <span>{item.label}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* FOOTER */}
        <div className="flex-none p-4 bg-black/20 border-t border-white/10">
          <button onClick={logout} className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition-all font-black text-[11px] uppercase tracking-widest active:scale-95">
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default StudentSidebar;