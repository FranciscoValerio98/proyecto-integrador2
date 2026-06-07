import React from 'react';
import { CalendarDays, Filter, ChevronRight } from 'lucide-react';

const Filters = ({ activeDay, setActiveDay, activeCategory, setActiveCategory, categories = [] }) => {

  // Generar los días de la semana actual dinámicamente alineados a 1-7
  const getWeekDays = () => {
    const days = [];
    const today = new Date();

    // Obtenemos el día de la semana actual de JS (0-6, donde 0 es Domingo)
    const currentJsDay = today.getDay();

    // Calculamos la diferencia para llegar al Lunes de esta semana
    // Si hoy es Domingo (0), restamos 6 para ir al lunes pasado. 
    // Si no, restamos (día actual - 1).
    const diffToMonday = currentJsDay === 0 ? -6 : 1 - currentJsDay;

    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);

    const names = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);

      const jsDay = date.getDay(); // 0 (Dom) a 6 (Sáb)

      // CONVERSIÓN A TU DB (1=Lun, 7=Dom)
      // Si jsDay es 0 (Domingo), devolvemos 7. Si no, el mismo número.
      const dbIndex = jsDay === 0 ? 7 : jsDay;

      days.push({
        name: names[jsDay],
        date: `${date.getDate()} ${months[date.getMonth()]}`,
        index: dbIndex // Enviamos 1, 2, 3, 4, 5, 6 o 7
      });
    }

    // Ordenar el array para que siempre se vea de Lunes a Domingo en la UI
    return days.sort((a, b) => a.index - b.index);
  };

  const days = getWeekDays();

  return (
    <div className="space-y-6 md:space-y-8 p-1">
      {/* --- SECTOR CALENDARIO --- */}
      <div className="flex flex-col gap-4 md:gap-5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 md:p-2 bg-blue-50 rounded-lg">
              <CalendarDays className="text-[#1e3a8a] w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h2 className="text-[11px] md:text-sm font-black text-[#1e3a8a] uppercase tracking-widest italic">
              Calendario de <span className="text-orange-500">Clases</span>
            </h2>
          </div>
          <div className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tight">
            Desliza <ChevronRight size={10} className="md:w-3 md:h-3" />
          </div>
        </div>

        <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-4 scrollbar-hide select-none snap-x touch-pan-x">
          {days.map((day) => {
            const isActive = activeDay === day.index;
            return (
              <button
                key={day.index}
                onClick={() => setActiveDay(day.index)}
                className={`min-w-[80px] md:min-w-[110px] flex-1 flex flex-col items-center border-2 rounded-xl md:rounded-2xl p-3 md:p-4 transition-all duration-300 snap-center relative overflow-hidden group ${isActive
                  ? 'border-orange-500 bg-white shadow-lg shadow-orange-100 scale-[0.98] md:scale-100'
                  : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-blue-200'
                  }`}
              >
                {isActive && <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>}

                <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1 transition-colors ${isActive ? 'text-orange-500' : 'text-slate-400'
                  }`}>
                  {day.name}
                </span>
                <span className={`text-sm md:text-lg font-black tracking-tighter transition-colors ${isActive ? 'text-[#1e3a8a]' : 'text-slate-500 group-hover:text-[#1e3a8a]'
                  }`}>
                  {day.date}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- SECTOR CATEGORÍAS --- */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide touch-pan-x">
          <div className="sticky left-0 bg-white/80 backdrop-blur-sm z-10 pr-2 border-r border-slate-200 self-center py-1">
            <Filter size={14} className="text-[#1e3a8a]" />
          </div>

          <div className="flex gap-2">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 md:px-5 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 border-2 ${isActive
                    ? 'bg-[#1e3a8a] border-[#1e3a8a] text-white shadow-md shadow-blue-900/20'
                    : 'bg-white border-slate-100 text-slate-500 hover:border-orange-200 hover:text-orange-500'
                    }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;