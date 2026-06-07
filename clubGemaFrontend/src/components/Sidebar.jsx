import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, GraduationCap, UserCog, CalendarRange,
    Settings, LogOut, MapPin, BarChart3, DollarSign,
    ChevronDown, History, CheckCircle, Activity, 
    TicketPercent, Megaphone, Ticket, ShieldAlert, Sparkles, Layers
} from 'lucide-react';
import { logoutService } from '../services/auth.service';
import toast from 'react-hot-toast';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();

    // Estado inicial de los menús (Operaciones abierto por defecto)
    const [openMenus, setOpenMenus] = useState({
        'Operaciones': true,
        'Academia': false,
        'Marketing & Retención': false,
        'Sistema & Soporte': false
    });

    const toggleMenu = (title) => {
        setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const handleLogout = async () => {
        try {
            await logoutService();
            toast.success('Sesión cerrada correctamente', { icon: '👋' });
            navigate('/login');
        } catch (error) {
            toast.error('Error al cerrar sesión');
        }
    };

    // 🚀 NUEVA ORGANIZACIÓN LÓGICA PARA EL ADMIN
    const menuGroups = [
        {
            title: 'Principal',
            type: 'link',
            icon: LayoutDashboard,
            path: '/dashboard/admin'
        },
        {
            title: 'Operaciones',
            type: 'dropdown',
            items: [
                { icon: GraduationCap, label: 'Alumnos', path: '/dashboard/admin/students' },
                { icon: UserCog, label: 'Coordinadores', path: '/dashboard/admin/teachers' },
                { icon: CheckCircle, label: 'Validar Pagos', path: '/dashboard/admin/payment-validation' },
            ]
        },
        {
            title: 'Academia',
            type: 'dropdown',
            items: [
                { icon: CalendarRange, label: 'Horarios Base', path: '/dashboard/admin/schedule' },
                { icon: Layers, label: 'Reprogramaciones', path: '/dashboard/admin/reprogramaciones' },
                { icon: MapPin, label: 'Sedes y Canchas', path: '/dashboard/admin/locations' },
                { icon: BarChart3, label: 'Niveles', path: '/dashboard/admin/levels' },
            ]
        },
        {
            title: 'Marketing & Retención',
            type: 'dropdown',
            items: [
                { icon: Megaphone, label: 'Publicaciones (Muro)', path: '/dashboard/admin/publications' },
                { icon: Sparkles, label: 'Anuncios Carrusel', path: '/dashboard/admin/anuncios-beneficios' },
                { icon: TicketPercent, label: 'Asignar Descuentos', path: '/dashboard/admin/benefits' },
                { icon: Ticket, label: 'Pases de Invitado', path: '/dashboard/admin/guest-passes' },
            ]
        },
        {
            title: 'Sistema & Soporte',
            type: 'dropdown',
            items: [
                { icon: Activity, label: "Control de Lesiones", path: "/dashboard/admin/injuries" },
                { icon: History, label: 'Depurar Recuperaciones', path: '/dashboard/admin/delete-makeups' },
                { icon: DollarSign, label: 'Catálogo de Precios', path: '/dashboard/admin/catalog' },
                { icon: Settings, label: 'Configuración', path: '/dashboard/admin/settings' },
            ]
        }
    ];

    return (
        <>
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 h-screen 
                bg-gradient-to-b from-[#1e3a8a] to-[#0f172a] text-white 
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:sticky md:top-0 md:translate-x-0 border-r border-white/10
                flex flex-col overflow-hidden shadow-2xl
            `}>

                {/* 🌟 LOGO CIRCULAR (Estilo Premium) */}
                <div className="flex-none pt-8 pb-6 px-4 flex flex-col items-center bg-white/5 relative">
                    <div className="relative z-10 w-[140px] aspect-square bg-white rounded-full p-2.5 shadow-2xl flex items-center justify-center border-[4px] border-white/10 overflow-hidden mb-3 hover:border-orange-500/30 transition-colors">
                        <Link to="/" className="relative z-10 hover:scale-105 transition-transform duration-300">
                            <img src="/Logo con borde blanco.png" alt="Logo Club Gema" className="w-full h-full object-cover" />
                        </Link>
                    </div>
                    <div className="text-center">
                        <span className="block font-black text-xl tracking-tighter uppercase italic text-white leading-none">
                            Gema<span className="text-orange-500">Admin</span>
                        </span>
                    </div>
                </div>

                {/* 🌟 BOTÓN DE ACCIÓN PRINCIPAL (El "Botón del Dinero") */}
                <div className="px-5 pb-6 pt-4 border-b border-white/10 relative z-20">
                    <Link
                        to="/dashboard/admin/payment-validation"
                        className="group relative w-full flex items-center justify-center gap-3 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transition-all duration-300 active:scale-95 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                        <CheckCircle size={18} className="relative z-10 group-hover:scale-110 transition-transform" />
                        <span className="relative z-10 text-[12px] font-black uppercase tracking-widest italic">Validar Pagos</span>
                    </Link>
                </div>

                {/* NAVEGACIÓN CON DROPDOWNS */}
                <nav className={`
                    flex-1 py-4 px-3 overflow-y-auto space-y-1
                    [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                `}>
                    <p className="px-4 text-[9px] font-black text-blue-300/40 uppercase tracking-[0.3em] mb-3">Panel de Control</p>

                    {menuGroups.map((group, idx) => (
                        <div key={idx} className="space-y-1">
                            {group.type === 'link' ? (
                                <Link
                                    to={group.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group/link ${location.pathname === group.path ? 'bg-blue-500/20 text-white shadow-inner border border-blue-400/20' : 'text-blue-100/60 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <group.icon size={18} className={location.pathname === group.path ? 'text-blue-400' : 'group-hover/link:text-orange-400 transition-colors'} />
                                    <span className="text-[12px] font-bold uppercase tracking-wider">{group.title}</span>
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

                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openMenus[group.title] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="pl-4 space-y-1 mt-1 border-l-2 border-white/5 ml-4">
                                            {group.items.map((item) => {
                                                const isActive = location.pathname === item.path;
                                                return (
                                                    <Link
                                                        key={item.path}
                                                        to={item.path}
                                                        onClick={() => onClose && onClose()}
                                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-[11px] font-bold uppercase tracking-wide ${isActive ? 'text-orange-400 bg-orange-400/10' : 'text-blue-100/50 hover:text-white hover:bg-white/5'}`}
                                                    >
                                                        <item.icon size={14} />
                                                        <span>{item.label}</span>
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
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition-all font-black text-[11px] uppercase tracking-widest active:scale-95">
                        <LogOut size={16} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Overlay Móvil */}
            {isOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden" onClick={onClose}></div>}
        </>
    );
};

export default Sidebar;