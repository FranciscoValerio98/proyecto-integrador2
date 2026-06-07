import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Ghost } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-6 relative overflow-hidden">

            {/* Elementos decorativos de fondo */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#1e3a8a]/20 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full"></div>

            <div className="max-w-2xl w-full text-center relative z-10">
                {/* Icono de error con estilo Gema */}
                <div className="mb-8 relative inline-block">
                    <div className="w-32 h-32 bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] rounded-[2.5rem] flex items-center justify-center border border-white/10 shadow-2xl animate-bounce">
                        <span className="text-7xl font-black text-white italic tracking-tighter">404</span>
                    </div>
                    {/* Balón de voley "fuera" */}
                    <div className="absolute -bottom-2 -right-4 bg-orange-500 p-3 rounded-2xl shadow-lg rotate-12">
                        <Trophy className="text-white" size={24} />
                    </div>
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">
                    ¡Balón <span className="text-orange-500">Fuera!</span>
                </h1>

                <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-md mx-auto font-medium">
                    Parece que este set se perdió. La página que buscas no está en nuestra cancha o ha sido movida.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/"
                        className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest px-8 py-4 rounded-2xl transition-all shadow-xl shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-3 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Volver al Inicio
                    </Link>

                    <Link
                        to="/dashboard/student"
                        className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black uppercase tracking-widest px-8 py-4 rounded-2xl transition-all backdrop-blur-md"
                    >
                        Ver mis horarios
                    </Link>
                </div>

                {/* Mensaje de apoyo sutil */}
                <div className="mt-16 flex items-center justify-center gap-3 opacity-30">
                    <div className="h-px w-12 bg-slate-500"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
                        Gema Performance Systems
                    </span>
                    <div className="h-px w-12 bg-slate-500"></div>
                </div>
            </div>

            {/* Marca de agua de fondo */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center">
                <span className="text-[20vw] font-black uppercase italic select-none">OUT</span>
            </div>
        </div>
    );
};

export default NotFound;