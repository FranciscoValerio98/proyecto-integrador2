import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import MobileNavbarAdmin from '../components/MobileNavbarAdmin'; // ✅ Importamos la nueva barra

const DashboardLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const { user, loading } = useAuth();

    const userData = user?.user || user; 
    
    const displayName = userData?.nombres 
        ? `${userData.nombres} ${userData.apellidos}` 
        : 'Usuario Gema';

    const initial = userData?.nombres 
        ? userData.nombres.charAt(0).toUpperCase() 
        : 'G';

    const userRole = userData?.rol || 'Personal';

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-[#1e3a8a]" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] flex">
            {/* SIDEBAR (Escritorio y Drawer móvil) */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* HEADER */}
                <header className="bg-white border-b-2 border-[#1e3a8a]/10 h-20 flex items-center justify-between px-4 sm:px-8 z-10">
                    
                    {/* El botón de menú lateral fue removido de aquí */}

                    <div className="md:hidden flex items-center">
                        <img
                            src="/logo.png"
                            alt="Gema Logo"
                            className="h-10 w-auto filter drop-shadow-[0_0_3px_rgba(255,255,255,1)]"
                        />
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        <div className="hidden sm:block w-px h-10 bg-slate-200 mx-2"></div>
                        <div className="flex items-center gap-4 group">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-black text-[#1e3a8a] leading-tight uppercase tracking-tight">
                                    {displayName}
                                </p>
                                <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-md mt-1">
                                    {userRole}
                                </span>
                            </div>

                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1e40af] to-[#0f172a] flex items-center justify-center text-white font-black border-2 border-white shadow-lg shadow-blue-900/20">
                                    {initial}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* MAIN: Añadimos pb-24 para que el MobileNavbarAdmin no tape el contenido */}
                <main className="flex-1 overflow-y-auto bg-[#f1f5f9] p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 relative">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none hidden xl:block">
                        <img src="/logo.png" alt="" className="w-96 h-auto rotate-12" />
                    </div>

                    <div className="max-w-7xl mx-auto relative z-10">
                        <Outlet />
                    </div>
                </main>

                {/* ✅ BARRA DE NAVEGACIÓN MÓVIL (Solo visible en pantallas pequeñas) */}
                <MobileNavbarAdmin />
            </div>
        </div>
    );
};

export default DashboardLayout;