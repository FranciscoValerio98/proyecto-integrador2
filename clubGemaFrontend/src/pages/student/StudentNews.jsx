import React, { useState, useEffect } from 'react';
import {
    Megaphone, Loader2, Calendar,
    Bell, Newspaper, Trophy, Star
} from 'lucide-react';
import apiFetch from '../../interceptors/api';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { API_ROUTES } from '../../constants/apiRoutes';

const StudentNews = () => {
    const [publicaciones, setPublicaciones] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPublicaciones = async () => {
        setLoading(true);
        try {
            const response = await apiFetch.get(API_ROUTES.PUBLICACIONES.BASE);
            const result = await response.json();
            if (response.ok) {
                const ordenadas = (result.data || []).sort((a, b) =>
                    new Date(b.creado_en) - new Date(a.creado_en)
                );
                setPublicaciones(ordenadas);

                if (ordenadas.length > 0) {
                    Cookies.set('last_viewed_news', String(ordenadas[0].id), { expires: 365, sameSite: 'strict' });
                    window.dispatchEvent(new Event('news_read'));
                }
            }
        } catch (error) {
            toast.error("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPublicaciones();
    }, []);

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-orange-500" size={48} />
            <p className="font-black text-[#1e3a8a] uppercase italic text-xs tracking-widest">Cargando Muro Gema...</p>
        </div>
    );

    return (
        <div className="w-full max-w-6xl mx-auto p-4 md:p-10 animate-fade-in pb-24">
            {/* HEADER */}
            <div className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                    <div className="flex items-center gap-2 mb-2 text-orange-500 justify-center md:justify-start">
                        <Trophy size={20} />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Novedades del Club</span>
                    </div>
                    <h1 className="text-6xl font-black text-[#1e3a8a] uppercase tracking-tighter italic leading-none">
                        MURO <span className="text-orange-500">GEMA</span>
                    </h1>
                </div>
                <div className="bg-[#1e3a8a] text-white px-8 py-4 rounded-[2rem] shadow-xl flex items-center gap-4 border-b-4 border-orange-500">
                    <Bell size={24} className="text-orange-400" />
                    <div>
                        <p className="text-[10px] font-black uppercase opacity-60 leading-none">Comunicados</p>
                        <p className="text-2xl font-black italic">{publicaciones.length}</p>
                    </div>
                </div>
            </div>

            {/* LISTA DE NOTICIAS EN PILA */}
            <div className="space-y-12">
                {publicaciones.length === 0 ? (
                    <div className="bg-white rounded-[3rem] border-4 border-dashed border-slate-200 p-24 text-center">
                        <Megaphone className="mx-auto text-slate-200 mb-6" size={80} />
                        <h3 className="text-xl font-black text-slate-400 uppercase italic">Aún no hay anuncios oficiales</h3>
                    </div>
                ) : (
                    publicaciones.map((pub) => (
                        <article key={pub.id} className="bg-white rounded-[3rem] border-2 border-slate-50 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col md:flex-row group transition-all duration-500 hover:border-orange-200">

                            {/* IMAGEN IZQUIERDA (50%) */}
                            <div className="md:w-1/2 h-80 md:h-auto overflow-hidden relative bg-slate-100 border-r border-slate-50">
                                {pub.imagen_url ? (
                                    <img
                                        src={pub.imagen_url}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        alt={pub.titulo}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Megaphone size={60} className="text-slate-200" />
                                    </div>
                                )}
                                <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg border border-slate-100">
                                    <span className="text-[10px] font-black text-[#1e3a8a] uppercase italic">
                                        {new Date(pub.creado_en).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {/* CONTENIDO DERECHA (50%) */}
                            <div className="md:w-1/2 p-10 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-8">
                                        {/* LOGO CON FONDO BLANCO Y BORDE */}
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-1.5 shadow-md border border-slate-100">
                                            <img src="/Logo con borde blanco.png" alt="Gema" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-[#1e3a8a] uppercase italic leading-none tracking-tight">Club Gema Oficial</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Sede Lima Norte</span>
                                        </div>
                                    </div>

                                    <h3 className="text-4xl font-black text-[#1e3a8a] uppercase italic tracking-tighter mb-4 leading-none group-hover:text-orange-500 transition-colors">
                                        {pub.titulo}
                                    </h3>
                                    <p className="text-slate-600 text-sm font-medium leading-relaxed italic line-clamp-6">
                                        {pub.contenido}
                                    </p>
                                </div>

                                {/* FOOTER DE LA NOTICIA */}
                                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[#1e3a8a]">
                                        <Newspaper size={18} className="text-orange-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Comunicado Oficial</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-orange-500">
                                        <Star size={14} className="fill-orange-500" />
                                        <span className="text-[10px] font-black uppercase italic tracking-tighter">Formando Campeones</span>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))
                )}
            </div>

            <p className="mt-20 text-center text-[10px] text-slate-300 font-black uppercase tracking-[0.5em] italic opacity-50">
                CLUB GEMA | COMUNIDAD
            </p>
        </div>
    );
};

export default StudentNews;