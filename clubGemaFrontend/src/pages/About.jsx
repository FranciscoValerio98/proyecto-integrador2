import React from 'react';
import { Target, Award, Shield, Zap, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="bg-white min-h-screen font-sans text-slate-900 overflow-x-hidden">

      {/* --- HERO SECTION: Impacto Visual --- */}
      <section className="relative min-h-[45vh] md:min-h-[50vh] flex items-center bg-[#0f172a] py-8 md:py-12 px-6 overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-[10%] -right-[5%] w-[500px] h-[500px] bg-orange-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute -bottom-[10%] -left-[5%] w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-6 backdrop-blur-md">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
            <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Más que un entrenamiento</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-[0.9]">
            Nuestra <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Esencia</span>
          </h1>
          <p className="mt-8 text-slate-400 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            Formamos atletas integrales. En Gema, la técnica se encuentra con la mentalidad ganadora para crear la próxima generación de campeones.
          </p>
        </div>
      </section>

      {/* --- STATS BAR: Autoridad --- */}
      <div className="relative z-20 -mt-12 max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-8 rounded-[32px] shadow-2xl shadow-blue-900/10 border border-slate-100">
          {[
            { label: 'Atletas', val: '+500', icon: Users },
            { label: 'Sedes', val: '03', icon: Shield },
            { label: 'Títulos', val: '12', icon: Trophy },
            { label: 'Coordinators', val: '15', icon: Award }
          ].map((s, i) => (
            <div key={i} className="text-center group">
              <p className="text-3xl font-black text-[#1e3a8a] italic tracking-tighter group-hover:text-orange-500 transition-colors">{s.val}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- HISTORIA & IMAGEN: Narrativa --- */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-20 items-center">

          <div className="relative order-2 lg:order-1">
            <div className="absolute -top-6 -left-6 w-full h-full border-2 border-orange-500/20 rounded-[40px] -z-10"></div>
            <div className="relative z-10 rounded-[40px] overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
              <img
                src="https://images.unsplash.com/photo-1592656094267-764a45160876?w=1200&q=80"
                alt="Entrenamiento"
                className="w-full h-full object-cover aspect-[4/5]"
              />
            </div>
            {/* El Badge "Rendimiento" ahora tiene z-30 para estar al frente de todo en su área */}
            <div className="absolute -bottom-10 -right-6 bg-[#1e3a8a] text-white p-8 rounded-3xl shadow-2xl z-30 hidden sm:block">
              <Zap className="text-orange-400 mb-2" size={32} />
              <p className="text-sm font-black uppercase tracking-widest leading-none">Alto</p>
              <p className="text-2xl font-black italic tracking-tighter">Rendimiento</p>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-2 bg-orange-500 rounded-full"></div>
              <h2 className="text-4xl md:text-5xl font-black text-[#1e3a8a] uppercase italic tracking-tighter">
                Formando el futuro del voley
              </h2>
            </div>

            <p className="text-slate-600 text-lg leading-relaxed font-medium">
              Nacimos con la visión de transformar el entrenamiento convencional en una experiencia de élite. No solo enseñamos fundamentos; cultivamos la resiliencia y el trabajo en equipo.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 pt-4">
              <div className="group p-6 bg-slate-50 rounded-[24px] border border-slate-100 hover:bg-white hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4 group-hover:bg-orange-500 group-hover:text-white transition-all">
                  <Target size={24} />
                </div>
                <h4 className="font-black text-[#1e3a8a] uppercase italic mb-2">Misión</h4>
                <p className="text-sm text-slate-500 font-medium">Liderar la formación técnica de atletas para alcanzar ligas profesionales.</p>
              </div>

              <div className="group p-6 bg-slate-50 rounded-[24px] border border-slate-100 hover:bg-white hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4 group-hover:bg-[#1e3a8a] group-hover:text-white transition-all">
                  <TrendingUp size={24} />
                </div>
                <h4 className="font-black text-[#1e3a8a] uppercase italic mb-2">Valores</h4>
                <p className="text-sm text-slate-500 font-medium">Integridad, disciplina y la búsqueda constante de la excelencia.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- SECCIÓN EXTRA: CTA --- */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-[#0f172a] rounded-[48px] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full opacity-20">
            <img src="https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=2000" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl md:text-5xl font-black text-white uppercase italic mb-8">¿Listo para escribir tu historia?</h3>
            <Link
              to="/register"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-[0.2em] px-10 py-5 rounded-2xl text-sm shadow-xl shadow-orange-500/20 transition-all hover:-translate-y-1 active:scale-95 text-center"
            >
              Únete al Club Gema
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

// Icono decorativo faltante
const Trophy = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
);

export default About;