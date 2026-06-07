import React, { useState } from 'react';
import MassRescheduleForm from '../../components/Admin/MassRescheduleForm';
import MassRescheduleHistory from '../../components/Admin/MassRescheduleHistory';
import FeriadoHistory from '../../components/Admin/FeriadoHistory';
import {
    History,
    Info,
    Bell,
    ShieldCheck,
    Cpu,
    Calendar,
    AlertOctagon,
    ArrowDown,
    ArrowRight
} from 'lucide-react';

const AdminReprogramaciones = () => {
    const [refreshSignal, setRefreshSignal] = useState(0);
    const [showFeriadoModal, setShowFeriadoModal] = useState(false);
    const handleRefresh = () => {
        setRefreshSignal(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20 overflow-x-hidden">

            {showFeriadoModal && (
                <FeriadoHistory onClose={() => setShowFeriadoModal(false)} />
            )}

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-[#1e3a8a] py-10 md:py-16 mb-8 md:mb-12">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-10">
                    <div className="w-96 h-96 rounded-full border-[40px] border-white animate-pulse"></div>
                </div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 opacity-10">
                    <div className="w-64 h-64 rounded-full bg-white rotate-45"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-400/20 text-blue-100 rounded-full text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur-md border border-white/10">
                                <Cpu size={14} />
                                Panel de Control Administrativo
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter mb-4 drop-shadow-lg leading-none">
                                REPROGRAMACIÓN <span className="text-blue-400">MASIVA</span>
                            </h1>
                            <p className="text-blue-100/80 text-base md:text-lg font-medium leading-relaxed">
                                Gestiona cambios globales en el calendario del club. Mueve bloques completos de clases y otorga compensaciones automáticas.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
                            <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                                <div className="p-2 bg-blue-500 rounded-xl shadow-lg">
                                    <Bell size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Notificaciones</p>
                                    <p className="text-sm font-bold text-white">Push Automáticas</p>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                                <div className="p-2 bg-green-500 rounded-xl shadow-lg">
                                    <ShieldCheck size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-green-300 uppercase tracking-widest">Seguridad</p>
                                    <p className="text-sm font-bold text-white">Ciclo +7 Días</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-10">

                {/* 🚨 PASO 1: FERIADOS (Arriba en celular, Izquierda en PC) */}
                <div className="lg:col-span-4 w-full">
                    <div className="relative">
                        <div className="absolute -top-3 -left-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-3 rounded-xl shadow-lg shadow-red-200/50 z-10 rotate-[-5deg] border-2 border-white">
                            PASO 1 OBLIGATORIO
                        </div>

                        <section className="bg-gradient-to-b from-white to-orange-50 rounded-[2rem] p-6 shadow-xl shadow-orange-100/50 border-2 border-orange-200 relative overflow-hidden">
                            <AlertOctagon className="absolute -right-6 -top-6 text-orange-100 w-32 h-32 opacity-50 pointer-events-none" />
                            <div className="relative z-10">
                                <div className="flex items-start gap-4 mb-3">
                                    <div className="p-3 bg-red-100 text-red-600 rounded-2xl shadow-inner shrink-0 mt-1">
                                        <Calendar size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl text-slate-800 leading-tight uppercase tracking-tight">Validar Feriados</h3>
                                        <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.15em] mb-1">¡Evita regalar clases!</p>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm mb-5">
                                    <p className="text-slate-600 text-[11px] font-bold leading-relaxed">
                                        Si vas a cancelar por <span className="text-red-500 font-black">FERIADO</span>, regístralo aquí primero.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowFeriadoModal(true)}
                                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <Calendar size={16} /> Revisar Calendario
                                </button>
                            </div>
                        </section>

                        <div className="flex justify-center mt-6 mb-2 opacity-60">
                            <div className="flex flex-col lg:flex-row items-center gap-2 animate-bounce text-orange-500">
                                <span className="text-[10px] font-black uppercase tracking-widest">Continuar en el Paso 2</span>
                                <ArrowDown size={20} className="lg:hidden" />
                                <ArrowRight size={20} className="hidden lg:block" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 📝 PASO 2: FORMULARIO (Después de Feriados en celular, Derecha en PC) */}
                <div className="lg:col-span-8 lg:row-span-2 w-full flex flex-col gap-6">
                    <div className="flex items-center justify-between pl-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-orange-500 rounded-full"></div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Paso 2: Editor de Reprogramación</h2>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        <div className="p-4 sm:p-8 md:p-12">
                            <MassRescheduleForm onSuccess={handleRefresh} />
                        </div>
                    </div>
                </div>

                {/* 📜 HISTORIAL (Al final en celular, debajo de Feriados en PC) */}
                <div className="lg:col-span-4 w-full">
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 pl-2">
                            <History size={20} className="text-[#1e3a8a]" />
                            <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest underline decoration-blue-500/30 underline-offset-8">
                                Historial de Lotes
                            </h2>
                        </div>

                        <div className="bg-white rounded-[2rem] shadow-lg border border-slate-100 overflow-hidden">
                            <div className="p-2 overflow-y-auto h-[500px] lg:h-[750px] xl:h-[850px] custom-scrollbar">
                                <MassRescheduleHistory refreshSignal={refreshSignal} />
                            </div>
                        </div>
                    </section>
                </div>

            </main>
        </div>
    );
};

export default AdminReprogramaciones;