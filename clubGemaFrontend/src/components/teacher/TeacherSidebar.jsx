import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ClipboardList, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TeacherSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logout } = useAuth();

  // Bloqueo de scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const menuItems = [
    { icon: ClipboardList, label: 'Mis Clases', path: '/dashboard/teacher' },
    { icon: User, label: 'Mi Perfil', path: '/dashboard/teacher/profile' },
    { icon: User, label: 'Dias de corte', path: '/dashboard/teacher/DiaCorte' },
  ];

  return (
    <>
      <aside className={`
        hidden md:flex flex-col
        fixed inset-y-0 left-0 z-50 w-64 h-screen 
        bg-gradient-to-b from-[#1e3a8a] to-[#0f172a] text-white 
        border-r border-white/10 shadow-2xl
        overflow-hidden
      `}>

        {/* SECCIÓN LOGO: Branding oficial unificado */}
        <div className="flex-none py-8 px-6 flex flex-col items-center border-b border-white/10">
          <div className="relative z-10 w-[180px] aspect-square bg-white rounded-full p-2 shadow-2xl flex items-center justify-center border-4 border-white/20 overflow-hidden">
            <Link to="/" className="relative z-10">
              <img src="/Logo con borde blanco.png" alt="Logo Club Gema" className="w-full h-full object-cover" />
            </Link>
          </div>
          <div className="text-center mt-4">
            <span className="block font-black text-xl tracking-tighter uppercase italic text-white leading-none">
              Gema<span className="text-orange-500 font-black">Coordinador</span>
            </span>
            <div className="h-1 w-8 bg-orange-500 mx-auto mt-2 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>
          </div>
        </div>

        {/* NAVEGACIÓN: Con scroll interno oculto */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto scrollbar-hide">
          <p className="px-4 text-[10px] font-black text-blue-300/50 uppercase tracking-[0.2em] mb-4">
            Panel de Coordinador
          </p>

          {clasesItems(menuItems, location, onClose)}
        </nav>

        {/* FOOTER: Logout unificado */}
        <div className="flex-none p-4 bg-black/20 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm text-red-400">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

// Función auxiliar para renderizar los items y mantener el código limpio
const clasesItems = (items, location, onClose) => items.map((item) => {
  const isActive = location.pathname === item.path;
  return (
    <Link
      key={item.path}
      to={item.path}
      onClick={onClose}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
        ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/40'
        : 'text-blue-100/60 hover:bg-white/5 hover:text-white'
        }`}
    >
      <item.icon
        size={20}
        className={`${isActive ? 'text-white' : 'group-hover:text-orange-400'} transition-colors`}
      />
      <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>
        {item.label}
      </span>
    </Link>
  );
});

export default TeacherSidebar;