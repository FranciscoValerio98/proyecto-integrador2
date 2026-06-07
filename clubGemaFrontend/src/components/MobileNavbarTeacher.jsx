import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    ClipboardList, Menu, X, LogOut, User
} from 'lucide-react';
import { logoutService } from '../services/auth.service';
import toast from 'react-hot-toast';

const MobileNavbarTeacher = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleLogout = async () => {
        try {
            await logoutService();
            toast.success('Sesión cerrada');
            navigate('/login');
        } catch (error) {
            toast.error('Error al salir');
        }
    };

    return (
        <>
            {/* PANEL LATERAL (DRAWER) */}
            <div className={`fixed inset-0 z-[60] ${isMenuOpen ? 'visible' : 'invisible'}`}>
                <div
                    className={`absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={toggleMenu}
                ></div>

                <div className={`absolute right-0 top-0 h-full w-[80%] max-w-sm bg-gradient-to-b from-[#1e3a8a] to-[#0f172a] shadow-2xl transition-transform duration-500 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col h-full border-l border-white/10">
                        <div className="p-6 flex justify-between items-center border-b border-white/10 bg-white/5">
                            <span className="font-black text-sm tracking-widest uppercase italic text-white flex gap-1">
                                Gema<span className="text-orange-500">Coordinador</span>
                            </span>
                            <button onClick={toggleMenu} className="p-2 bg-white/5 rounded-lg text-white/50">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            <div className="space-y-1">
                                <p className="px-4 text-[10px] font-black text-blue-300/40 uppercase tracking-[0.2em] mb-2">Panel del Coordinador</p>
                                <NavLink to="/dashboard/teacher" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-4 py-3 rounded-xl hover:bg-white/5"><ClipboardList size={18} /> Mis Clases</NavLink>
                                <NavLink to="/dashboard/teacher/profile" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-4 py-3 rounded-xl hover:bg-white/5"><User size={18} /> Mi Perfil</NavLink>
                                <NavLink to="/dashboard/teacher/DiaCorte" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-4 py-3 rounded-xl hover:bg-white/5"><User size={18} /> Dias de corte</NavLink>
                            </div>
                        </div>

                        <div className="p-4 bg-black/20">
                            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-red-400 bg-red-500/5 border border-red-500/20 font-bold text-sm">
                                <LogOut size={18} /> Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* BARRA INFERIOR */}
            <nav className="fixed bottom-0 left-0 w-full bg-[#0f172a] border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-50 md:hidden h-20">
                <div className="flex justify-around items-center h-full max-w-sm mx-auto px-4">

                    {/* INICIO */}
                    <NavLink to="/dashboard/teacher" end className={({ isActive }) => `flex flex-col items-center justify-center gap-1 w-full h-full transition-all ${isActive ? 'text-orange-500 scale-110' : 'text-blue-100/40 hover:text-blue-100/70'}`}>
                        {({ isActive }) => (
                            <>
                                <ClipboardList size={isActive ? 24 : 22} />
                                <span className="text-[9px] uppercase font-black tracking-tighter">Mis Clases</span>
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/dashboard/teacher/profile" className={({ isActive }) => `flex flex-col items-center justify-center gap-1 w-full h-full transition-all ${isActive ? 'text-orange-500 scale-110' : 'text-blue-100/40 hover:text-blue-100/70'}`}>
                        {({ isActive }) => (
                            <>
                                <User size={isActive ? 24 : 22} />
                                <span className="text-[9px] uppercase font-black tracking-tighter">Mi Perfil</span>
                            </>
                        )}
                    </NavLink>

                    <div className="w-px h-8 bg-white/10"></div>

                    {/* MÁS (MENÚ) */}
                    <button onClick={toggleMenu} className="flex flex-col items-center justify-center gap-1 w-full h-full text-blue-100/40 hover:text-blue-100/70 transition-all">
                        <Menu size={22} />
                        <span className="text-[9px] uppercase font-black tracking-tighter">Menú</span>
                    </button>

                </div>
            </nav>
        </>
    );
};

export default MobileNavbarTeacher;
