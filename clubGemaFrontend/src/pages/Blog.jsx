import React, { useState, useEffect } from 'react';
import {
  Calendar, User, ArrowRight, Trophy,
  Zap, Clock, Megaphone, Loader2, Star,
  Award, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../interceptors/api';
import { API_ROUTES } from '../constants/apiRoutes';


const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredPost, setFeaturedPost] = useState(null);

  const fetchPublicaciones = async () => {
    setLoading(true);
    try {
      const response = await apiFetch.get(API_ROUTES.PUBLICACIONES.BASE);
      const result = await response.json();
      if (response.ok) {
        const ordenadas = (result.data || []).sort((a, b) =>
          new Date(b.creado_en) - new Date(a.creado_en)
        );
        setPosts(ordenadas);
        setFeaturedPost(ordenadas[0]);
      }
    } catch (error) {
      console.error("Error al cargar el blog:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicaciones();
  }, []);

  const handleSelectPost = (post) => {
    setFeaturedPost(post);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a]">
      <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
      <p className="font-black text-white uppercase italic text-xs tracking-widest">ADN GEMA CARGANDO...</p>
    </div>
  );

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900 overflow-x-hidden">

      {/* --- HERO SECTION --- */}
      <section className="relative bg-[#0f172a] min-h-[45vh] md:min-h-[50vh] flex items-center py-8 md:py-12 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full -z-10">
          <div className="absolute -top-[10%] -right-[5%] w-[600px] h-[600px] bg-orange-500/10 blur-[130px] rounded-full"></div>
          <div className="absolute -bottom-[10%] -left-[5%] w-[500px] h-[500px] bg-blue-500/10 blur-[130px] rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-2 rounded-full mb-8 backdrop-blur-md">
            <Trophy size={16} className="text-orange-500" />
            <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Muro de Noticias Oficial</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-[0.85]">
            ADN <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">GEMA</span>
          </h1>
          <p className="mt-8 text-slate-400 max-w-2xl mx-auto text-lg font-medium italic">
            "Donde el talento se encuentra con la disciplina para crear leyendas."
          </p>
        </div>
      </section>

      {/* --- ARTÍCULO DESTACADO DINÁMICO --- */}
      {featuredPost && (
        <section className="relative z-20 -mt-16 max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-[50px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col lg:flex-row group transition-all duration-500 hover:border-orange-200">
            <div className="lg:w-1/2 h-[400px] lg:h-auto overflow-hidden bg-slate-100 relative">
              <img
                src={featuredPost.imagen_url || "https://images.unsplash.com/photo-1592656094267-764a45160876?w=1200"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                alt="Destacado"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
            </div>
            <div className="lg:w-1/2 p-12 md:p-20 flex flex-col justify-center space-y-8">
              <div className="flex items-center gap-3 text-orange-600">
                <TrendingUp size={22} strokeWidth={3} />
                <span className="text-sm font-black uppercase tracking-[0.2em]">Lectura Principal</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-[#1e3a8a] uppercase italic tracking-tighter leading-[0.9]">
                {featuredPost.titulo}
              </h2>
              <p className="text-slate-500 text-lg font-medium leading-relaxed italic line-clamp-4">
                {featuredPost.contenido}
              </p>
              <div className="flex items-center gap-8 text-slate-400 text-xs font-bold uppercase tracking-widest pt-8 border-t border-slate-100">
                <span className="flex items-center gap-2"><Calendar size={16} /> {new Date(featuredPost.creado_en).toLocaleDateString()}</span>
                <div className="flex items-center gap-3 text-[#1e3a8a]">
                  {/* LOGO MÁS GRANDE CON FONDO BLANCO */}
                  <div className="w-12 h-12 bg-white border-2 border-slate-100 rounded-2xl p-1.5 shadow-md">
                    <img src="/Logo con borde blanco.png" alt="Gema" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-black italic text-sm">Club Gema Oficial</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- GRID DE NOTICIAS --- */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="flex items-center gap-4 mb-20">
          <div className="h-12 w-3 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)]"></div>
          <h2 className="text-5xl font-black text-[#1e3a8a] uppercase italic tracking-tighter">Muro de Campeones</h2>
        </div>

        {posts.length === 0 ? (
          <div className="bg-slate-50 rounded-[3rem] p-24 text-center border-4 border-dashed border-slate-200">
            <Megaphone className="mx-auto text-slate-200 mb-4" size={80} />
            <p className="font-black text-slate-400 uppercase italic text-xl">Preparando nuevas noticias...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14">
            {posts.map((post) => (
              <article
                key={post.id}
                onClick={() => handleSelectPost(post)}
                className={`bg-white rounded-[50px] border-2 cursor-pointer overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 flex flex-col group ${featuredPost?.id === post.id ? 'border-orange-500 ring-4 ring-orange-500/10' : 'border-slate-50'}`}
              >
                <div className="h-72 relative overflow-hidden bg-slate-100">
                  <img
                    src={post.imagen_url || "https://images.unsplash.com/photo-1592656094267-764a45160876?w=800&q=80"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    alt={post.titulo}
                  />
                  {/* LOGO EN CARDS: MÁS GRANDE Y FONDO BLANCO */}
                  <div className="absolute top-6 left-6 bg-white px-4 py-2 rounded-2xl flex items-center gap-3 shadow-2xl border border-slate-100">
                    <div className="w-8 h-8 bg-white rounded-lg p-0.5">
                      <img src="/Logo con borde blanco.png" alt="Gema" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-[#1e3a8a] italic tracking-widest">Gema News</span>
                  </div>
                </div>

                <div className="p-10 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-slate-400 text-[11px] font-black uppercase tracking-widest mb-6">
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(post.creado_en).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-2xl font-black text-[#1e3a8a] uppercase italic tracking-tighter group-hover:text-orange-500 transition-colors line-clamp-2 leading-none mb-6">
                    {post.titulo}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed italic line-clamp-3 mb-8">
                    {post.contenido}
                  </p>
                  <div className="pt-8 mt-auto border-t border-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-orange-500">
                      <Award size={16} strokeWidth={3} />
                      <span className="text-[10px] font-black uppercase italic tracking-tighter">Formando Campeones</span>
                    </div>
                    <button className="text-[#1e3a8a] font-black uppercase text-[10px] tracking-widest flex items-center gap-2 group-hover:text-orange-600">
                      Leer <ArrowRight size={14} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Blog;