import React from 'react';
import { ChevronRight, Trophy, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    /* Reducimos la altura mínima y los paddings para compactarlo */
    <div className="relative w-full min-h-[45vh] md:min-h-[50vh] flex items-center bg-[#0f172a] overflow-hidden py-8 md:py-12">

      {/* 1. IMAGEN DE FONDO CON TINTE GEMA */}
      <img
        src="https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=2000&auto=format&fit=crop"
        alt="Voleibol Profesional"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-30 select-none"
      />

      {/* 2. OVERLAY (Degradado Gema) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/80 to-transparent"></div>

      {/* Decoración: Resplandor naranja más pequeño */}
      <div className="absolute -right-12 top-0 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full"></div>

      {/* 3. CONTENIDO */}
      <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col justify-center">

        <div className="max-w-2xl animate-fade-in-up mt-8">
          {/* Título: Reducido de text-7xl a text-6xl */}
          <h1 className="text-4xl md:text-6xl font-black text-white leading-[0.95] mb-4 uppercase italic tracking-tighter">
            Eleva tu juego <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
              al siguiente nivel
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-400 mb-8 leading-relaxed max-w-lg font-medium">
            Aprende. Juega. Compite.
          </p>

          {/* Botones de Acción: Más estilizados */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/register" className="bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest px-6 py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20 hover:-translate-y-1 active:scale-95 group">
              Inscribirme Ahora
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#programacion"
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black uppercase tracking-widest px-6 py-3.5 rounded-xl text-sm transition-all backdrop-blur-md flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Sparkles size={16} className="text-orange-500" />
              Ver Horarios
            </a>
          </div>

          {/* Texto motivacional */}
          <div className="mt-12 flex items-start gap-4 border-l-2 border-orange-500/30 pl-6 py-2">
            <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-md font-medium italic">
              "Mejora la técnica, tu rendimiento físico y gana seguridad en cada jugada."
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Hero;