import React, { useState, useEffect } from 'react';
import { Plus, Search, Trophy, Edit3, Trash2, ChevronRight, Loader2 } from 'lucide-react';
import AdminLevels from './AdminLevels';
import { apiFetch } from '../../interceptors/api';
import toast from 'react-hot-toast';
import { API_ROUTES } from '../../constants/apiRoutes';

const AdminLevelsManager = () => {
    const [view, setView] = useState('list');
    const [niveles, setNiveles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNivel, setSelectedNivel] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchNiveles = async () => {
        try {
            setLoading(true);
            const response = await apiFetch.get(API_ROUTES.NIVELES.BASE);
            const result = await response.json();
            if (response.ok) {
                setNiveles(result.data || []);
            }
        } catch (error) {
            toast.error("No se pudieron cargar los niveles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (view === 'list') fetchNiveles();
    }, [view]);

    const handleDelete = (id) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                        ¿Confirmas la eliminación?
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">
                        Esta acción no se puede deshacer.
                    </p>
                </div>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase hover:text-slate-600 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);

                            const deletePromise = async () => {
                                const response = await apiFetch.delete(API_ROUTES.NIVELES.BY_ID(id));
                                const result = await response.json();
                                if (!response.ok) throw new Error(result.message || "Error al eliminar");
                                fetchNiveles();
                                return result.message || "Nivel eliminado correctamente";
                            };

                            toast.promise(deletePromise(), {
                                loading: 'Procesando eliminación...',
                                success: (msg) => <b>{msg}</b>,
                                error: (err) => <b>{err.message}</b>,
                            });
                        }}
                        className="px-4 py-1.5 bg-red-500 text-white text-[10px] font-black rounded-lg uppercase shadow-lg shadow-red-200 hover:bg-red-600 transition-all"
                    >
                        Eliminar Nivel
                    </button>
                </div>
            </div>
        ), {
            duration: 5000,
            position: 'top-center',
            style: {
                borderRadius: '20px',
                background: '#fff',
                color: '#333',
                border: '1px solid #e2e8f0',
                padding: '16px',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
            },
        });
    };

    const handleEdit = (nivel) => {
        setSelectedNivel(nivel);
        setView('edit');
    };

    const filteredNiveles = Array.isArray(niveles)
        ? niveles.filter(n => n.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    if (view === 'create' || view === 'edit') {
        return <AdminLevels
            onBack={() => { setView('list'); setSelectedNivel(null); }}
            initialData={selectedNivel}
        />;
    }

    return (
        <div className="space-y-6 animate-fade-in-up p-1 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 mb-1">
                    <div className="h-6 w-1 bg-orange-500 rounded-full"></div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">
                        Gestión de <span className="text-[#1e3a8a]">Niveles</span>
                    </h1>
                </div>
                <button onClick={() => setView('create')} className="bg-[#1e3a8a] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-orange-500 transition-all group">
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    Nuevo Nivel
                </button>
            </div>

            {/* Buscador */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="BUSCAR NIVEL..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500/20"
                />
            </div>

            {loading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#1e3a8a]" size={40} /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNiveles.map((nivel) => (
                        <div key={nivel.id} className="bg-white rounded-3xl border border-slate-200 p-6 hover:shadow-xl transition-all group flex flex-col justify-between min-h-[160px]">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 text-[#1e3a8a] rounded-2xl group-hover:bg-[#1e3a8a] group-hover:text-white transition-all shadow-sm">
                                    <Trophy size={24} />
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEdit(nivel)}
                                        className="p-2 text-slate-300 hover:text-[#1e3a8a] transition-colors"
                                        title="Editar nombre"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(nivel.id)}
                                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                        title="Eliminar nivel"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-slate-800 text-lg uppercase italic leading-tight">
                                    {nivel.nombre}
                                </h3>
                                <ChevronRight size={20} className="text-slate-200 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredNiveles.length === 0 && !loading && (
                <div className="py-20 text-center text-slate-400 font-bold italic uppercase text-xs tracking-widest">
                    No se encontraron niveles registrados
                </div>
            )}
        </div>
    );
};

export default AdminLevelsManager;