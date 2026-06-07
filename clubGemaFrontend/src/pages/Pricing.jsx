import React, { useState, useEffect } from 'react';
import { Check, Rocket, Star, Zap, MapPin, Trophy, ShieldCheck, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { catalogoService } from '../services/catalogo.service';

const Pricing = () => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = React.useRef(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchPlanes = async () => {
      try {
        const response = await catalogoService.getVigentes();
        if (response.success) {
          // Mapeamos los datos de la DB a los estilos del front
          const planesConfigurados = response.data.map((plan, index) => {
            const isUnitario = plan.nombre.toUpperCase().includes('UNITARIA') || plan.nombre.toUpperCase().includes('SESIÓN') || plan.nombre.toUpperCase().includes('SESION');

            let config = {
              badge: isUnitario ? "Pago Único" : "Membresía",
              icon: <Rocket className="text-blue-600" size={26} />,
              features: [plan.nombre, "Acceso prioritario", "Comunidad oficial"],
              color: "border-slate-200 bg-white",
              textColor: "text-[#1e3a8a]",
              btnStyle: "bg-slate-100 text-[#1e3a8a] hover:bg-blue-100",
              recommended: false
            };

            if (index === 1) { // El del medio por defecto
              config.badge = "Más Versátil";
              config.icon = <MapPin className="text-blue-600" size={26} />;
              config.color = "border-blue-200 shadow-[0_20px_50px_rgba(249,115,22,0.1)] scale-105 bg-white";
              config.btnStyle = "bg-[#1e3a8a] text-white hover:bg-[#162a63] shadow-lg shadow-blue-900/20";
            }

            if (index === 2 || plan.precio_base >= 180) { // El más caro o el tercero
              config.badge = "Elite";
              config.recommended = true;
              config.icon = <Star className="text-orange-500" size={26} />;
              config.color = "border-orange-500 shadow-[0_20px_50px_rgba(249,115,22,0.1)] scale-105 bg-white z-10";
              config.btnStyle = "bg-[#f97316] text-white hover:bg-[#ea580c] shadow-xl shadow-orange-500/30";
            }

            // Si el plan tiene metadata de clases semanales de la DB, lo usamos
            const features = [
              plan.cantidad_clases_semanal ? `${plan.cantidad_clases_semanal} Sesiones semanales` : "Sesiones flexibles",
              "Kit de bienvenida",
              "Seguimiento técnico"
            ];

            return {
              ...plan,
              ...config,
              features
            };
          });
          setPlanes(planesConfigurados);
        }
      } catch (err) {
        console.error("Error fetching planes:", err);
        setError("No pudimos cargar los planes en este momento.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlanes();
  }, []);

  const handleScroll = (e) => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, offsetWidth } = e.target;
    // El scroll total disponible
    const maxScroll = scrollWidth - offsetWidth;
    if (maxScroll <= 0) return;

    // Calculamos el progreso del scroll y lo mapeamos a la cantidad de planes
    const progress = scrollLeft / maxScroll;
    const index = Math.round(progress * (planes.length - 1));

    setActiveTab(index);
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900">

      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-40 md:pt-24 md:pb-48 bg-[#0f172a] px-6 overflow-hidden">
        {/* Unificación de luces de fondo con la paleta */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute top-1/2 -left-24 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-6 md:mb-8 backdrop-blur-md">
            <Trophy size={14} className="text-orange-400" />
            <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Temporada 2026</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white uppercase italic tracking-tighter leading-none mb-6">
            Elige tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Plan de Juego</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-xl font-medium leading-relaxed px-4">
            Entrenamiento de excelencia con la misma pasión en cada nivel.
          </p>
        </div>
      </section>

      {/* --- GRID DE PRECIOS --- */}
      <section className="relative z-20 -mt-16 md:-mt-28 max-w-[95rem] mx-auto px-4 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/10 backdrop-blur-md rounded-[3rem] border border-white/10">
            <Loader2 className="text-orange-500 animate-spin mb-4" size={48} />
            <p className="text-white font-bold tracking-widest uppercase text-xs">Cargando niveles de formación...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[3rem] text-center">
            <p className="text-red-400 font-bold">{error}</p>
          </div>
        ) : (
          <>
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto pt-6 pb-10 snap-x snap-mandatory hide-scrollbar lg:grid lg:grid-cols-5 lg:gap-4 xl:gap-6 lg:overflow-visible lg:pb-0 lg:pt-0 scroll-smooth px-[10%] sm:px-[15%] lg:px-0 gap-6"
            >
              {planes.map((opt) => (
                <div
                  key={opt.id}
                  className={`relative p-6 xl:p-8 rounded-[2.5rem] border-2 transition-all duration-500 flex flex-col h-full hover:-translate-y-2 snap-center min-w-[80vw] sm:min-w-[60vw] lg:min-w-0 ${opt.color} shadow-xl lg:shadow-none mb-4 lg:mb-0`}
                >
                  {opt.recommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#f97316] text-white px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1 z-20 whitespace-nowrap">
                      <Zap size={10} fill="currentColor" /> RECOMENDADO
                    </div>
                  )}

                  {/* Icon & Badge - Unificados */}
                  <div className="flex justify-between items-center mb-8">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 flex-shrink-0">
                      {React.cloneElement(opt.icon, { size: 22 })}
                    </div>
                    <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border border-slate-200/50 truncate ml-2">
                      {opt.badge}
                    </span>
                  </div>

                  {/* Area de Precio - Consistente con el Azul */}
                  <div className="mb-6">
                    <h3 className={`text-base xl:text-lg font-black uppercase italic tracking-tighter mb-1 leading-tight ${opt.textColor} line-clamp-2 min-h-[2.5rem]`}>
                      {opt.nombre}
                    </h3>
                    <div className="flex items-start gap-0.5">
                      <span className="text-sm font-black text-slate-900 mt-1">S/</span>
                      <span className={`text-5xl xl:text-6xl font-black tracking-tighter leading-none ${opt.textColor}`}>{Math.round(opt.precio_base)}</span>
                      <span className="text-slate-400 text-[8px] font-bold uppercase tracking-widest self-end mb-1.5 ml-0.5">
                        {opt.nombre.toUpperCase().includes('UNITARIA') || opt.nombre.toUpperCase().includes('SESIÓN') || opt.nombre.toUpperCase().includes('SESION') ? '/ sesión' : '/ mes'}
                      </span>
                    </div>
                  </div>

                  {/* Features - Iconos verdes unificados */}
                  <div className="space-y-3 mb-8 flex-grow">
                    {opt.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mt-0.5">
                          <Check size={10} strokeWidth={4} />
                        </div>
                        <p className="text-[12px] xl:text-sm font-bold text-slate-600 tracking-tight italic leading-snug">
                          {feature}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Botones con paleta unificada */}
                  <Link
                    to="/register"
                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[9px] text-center transition-all active:scale-95 flex items-center justify-center gap-2 group/btn ${opt.btnStyle} mt-auto overflow-hidden text-ellipsis whitespace-nowrap`}
                  >
                    Inscribirme
                    <ChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform flex-shrink-0" />
                  </Link>
                </div>
              ))}
            </div>

            {/* Pagination Dots for Mobile */}
            <div className="flex justify-center gap-2 mt-4 lg:hidden">
              {planes.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${activeTab === i ? 'w-6 bg-orange-500' : 'w-2 bg-slate-300'}`}
                />
              ))}
            </div>
          </>
        )}

      </section>

      {/* --- SECCIÓN INFERIOR --- */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="bg-[#0f172a] rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <img src="https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=2000" className="w-full h-full object-cover" alt="voleibol" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h3 className="text-4xl md:text-6xl font-black text-white uppercase italic leading-tight mb-6 tracking-tighter">
              ¿Quieres sentir la <span className="text-orange-500 text-glow">Energía</span>?
            </h3>
            <p className="text-slate-400 mb-10 text-base md:text-lg font-medium leading-relaxed max-w-xl mx-auto">
              Visítanos en cualquiera de nuestras sedes y descubre el plan perfecto para tu nivel.
            </p>
            <div className="flex justify-center">
              <Link to="/register" className="bg-[#f97316] text-white hover:bg-white hover:text-[#0f172a] font-black uppercase tracking-[0.2em] px-8 md:px-12 py-5 md:py-8 rounded-2xl md:rounded-3xl text-[10px] md:text-sm transition-all shadow-2xl shadow-orange-500/40 hover:-translate-y-2 flex items-center justify-center text-center gap-4 border-2 border-transparent hover:border-orange-500 max-w-2xl">
                ¡Acercate a una de nuestras sedes y pregunta por nuestros planes!
                <MapPin size={24} fill="currentColor" className="animate-bounce flex-shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Pricing;