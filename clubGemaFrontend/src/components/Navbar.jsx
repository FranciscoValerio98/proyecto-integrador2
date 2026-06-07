import React, { useState } from 'react';
import { Bell, Menu, X, UserCircle, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const navLinks = [
    { label: 'Inicio', path: '/' },
    { label: 'Nosotros', path: '/about' },
    { label: 'Planes', path: '/pricing' },
    { label: 'Blog', path: '/blog' },
  ];

  const currentUser = user?.user || user;
  const firstName = currentUser?.nombres ? currentUser.nombres.split(' ')[0] : null;
  const initial = firstName ? firstName.charAt(0).toUpperCase() : '';

  const getDashboardPath = () => {
    if (!currentUser) return '/login';
    switch (currentUser.rol) {
      case 'Alumno':
        return '/dashboard/student';
      case 'Coordinador':
        return '/dashboard//teacher';
      case 'Administrador':
        return '/dashboard//admin';
      default:
        return '/login';
    }
  };

  const targetPath = getDashboardPath();

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Altura ajustada a h-20 para un look más compacto y moderno */}
        <div className="flex justify-between items-center h-24">

          {/* --- BLOQUE LOGO --- */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex-shrink-0">
              {/* Logo reducido a w-14 h-14 */}
              <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-blue-900/10 group-hover:scale-105 transition-transform overflow-hidden border border-slate-50">
                <img
                  src="/logo_diamante.jpeg"
                  alt="Logo"
                  className="w-full h-full object-contain p-1.5 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                />
              </div>
              {/* Punto naranja decorativo escalado */}
              <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-orange-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>

            <div className="flex flex-col">
              <span className="text-2xl font-black text-[#1e3a8a] tracking-tighter uppercase italic leading-none">
                Club<span className="text-orange-500">Gema</span>
              </span>
            </div>
          </Link>

          {/* Menú Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${location.pathname === link.path
                  ? 'text-[#1e3a8a] bg-blue-50'
                  : 'text-slate-500 hover:text-orange-500 hover:bg-orange-50'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Acciones Derecha */}
          <div className="hidden md:flex items-center gap-4">
            <div className="h-8 w-px bg-slate-200 mx-1"></div>

            <Link
              to={targetPath}
              className="flex items-center gap-2.5 pl-2 group"
            >
              <div className="text-right hidden lg:block">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Mi Portal</p>
                <p className="text-xs font-black text-[#1e3a8a] group-hover:text-orange-500 transition-colors mt-0.5">{currentUser ? firstName : 'Ingresar'}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#1e3a8a] group-hover:text-white transition-all border border-slate-100 shadow-sm">
                <UserCircle size={22} />
              </div>
            </Link>
          </div>

          {/* Mobile Hamburguesa */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-xl transition-all ${isOpen ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-slate-100 text-[#1e3a8a]'
                }`}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Menú Móvil */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 absolute w-full left-0 shadow-2xl animate-fade-in-down z-50">
          <div className="px-5 py-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest text-[#1e3a8a] bg-slate-50/50 hover:bg-blue-50 transition-all"
              >
                {link.label}
                <ChevronRight size={18} className="text-orange-500" />
              </Link>
            ))}

            <div className="pt-4 mt-4 border-t border-slate-100">
              <Link
                to={targetPath}
                onClick={() => setIsOpen(false)}
                className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-black uppercase tracking-widest text-sm shadow-lg transition-all
                  ${currentUser
                    ? 'bg-gradient-to-br from-[#1e40af] to-[#0f172a] text-white shadow-blue-900/20'
                    : 'bg-[#1e3a8a] text-white shadow-blue-900/20'}`}
              >
                <UserCircle size={20} />
                {currentUser ? 'Ir a mi Portal' : 'Iniciar Sesión'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;