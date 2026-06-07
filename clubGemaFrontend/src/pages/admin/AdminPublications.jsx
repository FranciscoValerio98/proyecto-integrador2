import React, { useState, useEffect } from 'react';
import {
    Megaphone, Plus, ArrowLeft, Image as ImageIcon,
    CheckCircle, Loader2, Trash2, Calendar, User, AlertCircle
} from 'lucide-react';
import apiFetch from '../../interceptors/api'; // Interceptor que maneja FormData
import { useAuth } from '../../context/AuthContext'; // Contexto para el ID del Admin
import toast from 'react-hot-toast';
import { API_ROUTES } from '../../constants/apiRoutes';

const AdminPublications = () => {
    const { userId } = useAuth(); // ID del administrador logueado
    const [view, setView] = useState('list'); // Control de vistas: 'list' o 'create'
    const [publicaciones, setPublicaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Estados del Formulario de Creación
    const [titulo, setTitulo] = useState('');
    const [contenido, setContenido] = useState('');
    const [imagenFile, setImagenFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Función para obtener las publicaciones del backend
    const fetchPublicaciones = async () => {
        setLoading(true);
        try {
            const response = await apiFetch.get(API_ROUTES.PUBLICACIONES.BASE);
            const result = await response.json();
            if (response.ok) {
                setPublicaciones(result.data || []);
            } else {
                toast.error("Error al cargar las publicaciones");
            }
        } catch (error) {
            toast.error("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPublicaciones();
    }, []);

    // Manejo de la imagen (Igual que en ReportPaymentModal)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                return toast.error("Por favor sube un archivo de imagen válido");
            }
            setImagenFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Envío del formulario usando FormData
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!titulo.trim() || !contenido.trim()) return toast.error("Completa los campos");

        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('titulo', titulo);
            data.append('contenido', contenido);
            data.append('autor_id', parseInt(userId)); // Usamos el 13 que ya vimos que existe

            if (imagenFile) {
                // Asegúrate de que la llave sea 'imagen'
                data.append('imagen', imagenFile);
            }

            // 🚀 LLAMADA LIMPIA: No pases {} como tercer argumento si no es necesario
            const response = await apiFetch.post(API_ROUTES.PUBLICACIONES.BASE, data);

            if (response.ok) {
                toast.success("¡Publicado!");
                setView('list');
                fetchPublicaciones();
            } else {
                const errorRes = await response.json();
                console.error("Error Backend:", errorRes);
                toast.error(errorRes.message || "Error 500");
            }
        } catch (error) {
            toast.error("Error de conexión");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar esta noticia?")) return;
        try {
            const response = await apiFetch.delete(API_ROUTES.PUBLICACIONES.BY_ID(id));
            if (response.ok) {
                toast.success("Publicación eliminada");
                fetchPublicaciones();
            }
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    // ==========================================
    // RENDER: FORMULARIO DE CREACIÓN
    // ==========================================
    if (view === 'create') {
        return (
            <div className="space-y-6 animate-fade-in-up p-1 pb-20">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('list')} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-600">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black italic uppercase tracking-tight text-slate-900">
                                Nueva <span className="text-[#1e3a8a]">Publicación</span>
                            </h1>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Anuncio para la comunidad Gema</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden max-w-3xl mx-auto">
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título del Anuncio</label>
                            <input
                                type="text"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-black text-[#1e3a8a] outline-none focus:border-orange-500 transition-colors"
                                placeholder="EJ: ¡MAÑANA GRAN TORNEO!"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contenido</label>
                            <textarea
                                value={contenido}
                                onChange={(e) => setContenido(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium text-slate-700 outline-none focus:border-orange-500 min-h-[180px] resize-none"
                                placeholder="Escribe los detalles aquí..."
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Imagen Destacada</label>
                            <input type="file" id="pub-image" className="hidden" accept="image/*" onChange={handleFileChange} />
                            <label htmlFor="pub-image" className="block bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] py-10 text-center cursor-pointer hover:bg-orange-50 hover:border-orange-200 transition-all">
                                {previewUrl ? (
                                    <img src={previewUrl} className="h-40 mx-auto rounded-2xl shadow-lg" alt="Preview" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <UploadIcon className="text-slate-300" size={40} />
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Seleccionar Imagen</p>
                                    </div>
                                )}
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-[#1e3a8a] hover:bg-orange-600 text-white font-black py-5 rounded-[2rem] transition-all flex items-center justify-center gap-3 disabled:bg-slate-300 shadow-xl shadow-blue-900/10 active:scale-95"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={20} /> : <Megaphone size={20} />}
                            {submitting ? "PROCESANDO..." : "PUBLICAR EN EL MURO"}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // ==========================================
    // RENDER: LISTADO DE PUBLICACIONES
    // ==========================================
    return (
        <div className="space-y-6 animate-fade-in-up p-1 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black italic uppercase tracking-tight text-slate-900">
                        Muro de <span className="text-[#1e3a8a]">Publicaciones</span>
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Anuncios y noticias del club</p>
                </div>
                <button
                    onClick={() => setView('create')}
                    className="bg-gradient-to-r from-[#1e3a8a] to-[#0f172a] hover:from-orange-500 hover:to-orange-600 text-white px-8 py-3 rounded-2xl font-black uppercase italic text-xs flex items-center gap-2 transition-all duration-300 shadow-xl"
                >
                    <Plus size={20} />
                    Crear Noticia
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#1e3a8a]" size={40} /></div>
            ) : publicaciones.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
                    <Megaphone className="mx-auto text-slate-200 mb-4" size={60} />
                    <h3 className="text-sm font-black text-slate-400 uppercase italic">No hay publicaciones activas</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {publicaciones.map((pub) => (
                        <div key={pub.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col group">
                            {pub.imagen_url && (
                                <div className="h-48 overflow-hidden">
                                    <img src={pub.imagen_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="News" />
                                </div>
                            )}
                            <div className="p-7 flex-1 flex flex-col">
                                <h3 className="font-black text-[#1e3a8a] uppercase italic text-lg mb-3 line-clamp-2">{pub.titulo}</h3>
                                <p className="text-slate-600 text-sm font-medium line-clamp-4 flex-1">{pub.contenido}</p>

                                <div className="mt-6 pt-5 border-t border-slate-100 flex justify-between items-center">
                                    <div className="text-[9px] font-black text-slate-400 uppercase italic space-y-1">
                                        <div className="flex items-center gap-2"><Calendar size={12} /> {new Date(pub.creado_en).toLocaleDateString()}</div>
                                        <div className="flex items-center gap-2 text-[#1e3a8a]"><User size={12} /> {pub.administrador?.usuarios?.nombres || 'Admin'}</div>
                                    </div>
                                    <button onClick={() => handleDelete(pub.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Icono auxiliar para el diseño
const UploadIcon = ({ size, className }) => (
    <div className={`p-4 bg-slate-100 rounded-full ${className}`}>
        <ImageIcon size={size} />
    </div>
);

export default AdminPublications;