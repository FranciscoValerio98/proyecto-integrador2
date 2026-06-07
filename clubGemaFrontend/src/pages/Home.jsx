import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Filters from '../components/Home/Filters';
import ClassCard from '../components/Home/ClassCard';
import Hero from '../components/Home/Hero';
import horarioService from '../services/horario.service';
import { apiFetch } from '../interceptors/api';
import { API_ROUTES } from '../constants/apiRoutes';

function Home() {
  // Inicializamos en 1 (Lunes) o según el día actual ajustado a tu escala 1-7
  const [activeDay, setActiveDay] = useState(new Date().getDay() === 0 ? 7 : new Date().getDay());
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [classes, setClasses] = useState([]);
  const [categories, setCategories] = useState(['Todas']);
  const [loading, setLoading] = useState(true);

  // Mapeo de nombres para mostrar en la UI si es necesario
  const diasSemanaNombres = {
    1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves", 5: "Viernes", 6: "Sábado", 7: "Domingo"
  };

  const formatTime = (value) => {
    if (!value) return "00:00";

    try {
      let date;

      if (value instanceof Date) {
        date = value;
      } else {
        date = new Date(value);
      }

      if (isNaN(date.getTime())) {
        if (typeof value === 'string' && value.includes(':')) {
          return value.substring(0, 5);
        }
        return "00:00";
      }

      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');

      return `${hours}:${minutes}`;
    } catch (e) {
      console.error("Error formateando hora:", e);
      return "00:00";
    }
  };

  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        setLoading(true);
        const [data, nivelesRes] = await Promise.all([
          horarioService.obtenerDisponibles(),
          apiFetch.get(API_ROUTES.NIVELES.BASE)
        ]);

        const nivelesData = await nivelesRes.json();
        const allNiveles = ['Todas', ...(nivelesData.data || []).map(n => n.nombre)];
        setCategories(allNiveles);

        const formattedClasses = data.map(h => ({
          id: h.id,
          title: h.nivel?.nombre || "Entrenamiento Voleibol",
          category: h.nivel?.nombre || "General",
          time: `${formatTime(h.hora_inicio)} - ${formatTime(h.hora_fin)}`,
          location: h.cancha?.sede?.nombre || h.cancha?.nombre || "Sede Gema",
          coordinator: h.coordinador?.nombre_completo || "Staff Gema",
          spots: h.capacidad_max || 0,
          price: h.precio || 0,
          image: h.imagen_url || "https://images.unsplash.com/photo-1592656094267-764a45160876?w=800&q=80",
          dia_id: h.dia_semana
        }));

        setClasses(formattedClasses);
      } catch (error) {
        console.error("Error al obtener datos principales de Home:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHorarios();
  }, []);

  // Filtrado por el ID numérico del día (1 al 7)
  const filteredClasses = classes.filter(clase => {
    const matchDay = clase.dia_id === activeDay;
    const matchCategory = activeCategory === 'Todas' || clase.category === activeCategory;
    return matchDay && matchCategory;
  });

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans text-slate-900 flex flex-col overflow-x-hidden">
      <Hero />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6 md:py-16 flex-grow">
        <div id="programacion" className="mb-6 md:mb-12 scroll-mt-24">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <div className="h-5 w-1.5 md:h-8 bg-[#cd5a2c] rounded-full"></div>
            <h2 className="text-xl md:text-3xl font-black text-[#263e5e] uppercase italic tracking-tighter leading-tight">
              Programación <span className="text-[#cd5a2c]">Semanal</span>
            </h2>
          </div>
          <p className="text-[11px] md:text-base text-slate-500 font-medium ml-3.5 md:ml-4 leading-relaxed">
            Reserva tu cupo en nuestras clases de entrenamiento.
          </p>

          <div className="mt-5 md:mt-8 bg-white p-1 md:p-2 rounded-xl md:rounded-3xl shadow-sm border border-slate-100 overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div className="inline-block min-w-full align-middle">
              <Filters
                activeDay={activeDay}
                setActiveDay={setActiveDay}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                categories={categories}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#cd5a2c]"></div>
            <p className="mt-4 text-slate-400 font-bold uppercase text-xs tracking-widest">Cargando horarios...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-10">
            {filteredClasses.map((clase) => (
              <div
                key={clase.id}
                className="transform transition-all duration-300 active:scale-[0.97] md:hover:-translate-y-2"
              >
                <ClassCard {...clase} />
              </div>
            ))}
          </div>
        )}

        {!loading && filteredClasses.length === 0 && (
          <div className="text-center py-10 md:py-24 bg-white rounded-[24px] md:rounded-[40px] border-2 border-dashed border-slate-200 shadow-inner mx-2 md:mx-0">
            <div className="w-12 h-12 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl md:text-4xl">🏐</span>
            </div>
            <h3 className="text-sm md:text-xl font-bold text-slate-400 uppercase tracking-widest px-4">
              Sin clases disponibles
            </h3>
            <p className="text-xs text-slate-400 mt-2">No hay sesiones para el {diasSemanaNombres[activeDay]}</p>
            <button
              onClick={() => {
                const today = new Date().getDay() === 0 ? 7 : new Date().getDay();
                setActiveDay(today);
                setActiveCategory('Todas');
              }}
              className="mt-6 text-[#1e3a8a] font-black uppercase text-[10px] tracking-widest py-2 px-4 bg-slate-50 rounded-lg active:bg-slate-100"
            >
              Restablecer Filtros
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;