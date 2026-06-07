import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Trophy, RefreshCcw, Users, Gift, HeartPulse, Sparkles } from 'lucide-react';

const StudentAnnouncements = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const beneficios = [
    {
      id: 1,
      tipo: 'SISTEMA DE RECUPERACIÓN',
      titulo: '¡No pierdas tu progreso!',
      descripcion: 'Entrena 2-3 veces/semana y recupera hasta 2 clases. Si vas 4 veces, ¡recupera hasta 4! Tienes hasta el mes siguiente.',
      icon: <RefreshCcw size={32} />,
      gradient: 'from-[#1e3a8a] to-blue-600',
      badge: 'FLEXIBILIDAD'
    },
    {
      id: 2,
      tipo: 'PROGRAMA REFERIDOS',
      titulo: 'Entrenar con amigos paga',
      descripcion: 'Por cada referido que se inscriba, obtén S/ 10 de descuento directo en tu siguiente mensualidad. ¡Sin límites!',
      icon: <Users size={32} />,
      gradient: 'from-orange-600 to-orange-400',
      badge: 'AHORRO'
    },
    {
      id: 3,
      tipo: 'GESTIÓN DE SALUD',
      titulo: 'Tu salud es prioridad',
      descripcion: '¿Te lesionaste? Congelamos tus clases para que las recuperes todas dentro de tu mes pagado o el siguiente.',
      icon: <HeartPulse size={32} />,
      gradient: 'from-red-600 to-red-400',
      badge: 'CUIDADO'
    },
    {
      id: 4,
      tipo: 'DISCIPLINA GEMA',
      titulo: 'Bonos por Rendimiento',
      descripcion: 'Premiamos tu esfuerzo constante en la cancha con beneficios y merchandising exclusivo del Club.',
      icon: <Trophy size={32} />,
      gradient: 'from-yellow-600 to-yellow-400',
      badge: 'PREMIO'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => nextSlide(), 6000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const nextSlide = () => setCurrentIndex((prev) => (prev === beneficios.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? beneficios.length - 1 : prev - 1));

  const item = beneficios[currentIndex];

  return (
    <div className="w-full">
      {/* Header del Carrusel */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-1.5 rounded-lg shadow-lg shadow-orange-500/20">
            <Gift size={16} className="text-white" />
          </div>
          <h2 className="font-black uppercase tracking-[0.2em] text-[11px] italic text-[#1e3a8a]">
            Beneficios Exclusivos <span className="text-orange-500">Gema</span>
          </h2>
        </div>
      </div>

      {/* Main Card */}
      <div className="relative group h-[200px] md:h-[180px] w-full overflow-hidden rounded-[2.5rem] shadow-2xl shadow-slate-300/50 border-4 border-white">
        {/* Fondo con Gradiente Dinámico */}
        <div className={`absolute inset-0 transition-all duration-700 ease-in-out bg-gradient-to-br ${item.gradient}`}>
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
             <Sparkles size={120} />
          </div>
        </div>

        {/* Contenido del Slide */}
        <div className="relative h-full p-6 md:p-8 text-white flex flex-col md:flex-row items-center gap-6 z-10">
          <div className="bg-white/20 backdrop-blur-md p-4 rounded-[2rem] border border-white/30 hidden md:block">
            {item.icon}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="bg-white/20 text-[8px] font-black px-3 py-1 rounded-full backdrop-blur-md uppercase tracking-widest">
                {item.badge}
              </span>
              <span className="text-[10px] font-bold opacity-80 uppercase italic tracking-tighter">
                {item.tipo}
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black uppercase italic leading-none mb-2 tracking-tighter">
              {item.titulo}
            </h3>
            <p className="text-xs md:text-sm font-medium opacity-90 leading-snug max-w-xl">
              {item.descripcion}
            </p>
          </div>

          {/* Navegación lateral integrada */}
          <div className="flex gap-2">
            <button onClick={prevSlide} className="p-2 bg-black/10 hover:bg-black/20 rounded-full transition-all border border-white/10 backdrop-blur-sm">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextSlide} className="p-2 bg-black/10 hover:bg-black/20 rounded-full transition-all border border-white/10 backdrop-blur-sm">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Barra de progreso inferior */}
        <div className="absolute bottom-0 left-0 h-1 bg-black/20 w-full">
          <div 
            className="h-full bg-white transition-all duration-[6000ms] ease-linear"
            style={{ width: `${((currentIndex + 1) / beneficios.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentAnnouncements;