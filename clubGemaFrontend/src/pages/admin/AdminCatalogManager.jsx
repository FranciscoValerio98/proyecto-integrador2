import React, { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, Tag, Edit3, Filter } from 'lucide-react'; // Quitamos Plus de los imports
import { apiFetch } from '../../interceptors/api';
import AdminCatalog from './AdminCatalog';
import toast from 'react-hot-toast';
import { API_ROUTES } from '../../constants/apiRoutes';

const AdminCatalogManager = () => {
    const [view, setView] = useState('list');
    const [loading, setLoading] = useState(true);
    const [conceptos, setConceptos] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [vigenciaFilter, setVigenciaFilter] = useState('VIGENTE');

    const fetchCatalog = async () => {
        try {
            setLoading(true);
            const response = await apiFetch.get(API_ROUTES.CATALOGO.BASE);
            const result = await response.json();
            if (response.ok) {
                setConceptos(result.data || []);
            }
        } catch (error) {
            toast.error("Error al cargar el catálogo");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCatalog(); }, []);

    const filteredData = useMemo(() => {
        return conceptos.filter(c => {
            const matchesSearch = c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.codigo_interno?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesVigencia = vigenciaFilter === 'ALL' ? true :
                vigenciaFilter === 'VIGENTE' ? c.es_vigente === true :
                    c.es_vigente === false;

            return matchesSearch && matchesVigencia;
        });
    }, [conceptos, searchTerm, vigenciaFilter]);

    const handleEdit = (item) => {
        setSelectedItem(item);
        setView('edit');
    };

    // Mantenemos la lógica de edit, pero creamos una protección visual al no tener botón 'create'
    if (view === 'create' || view === 'edit') {
        return (
            <AdminCatalog
                editData={selectedItem}
                onBack={() => {
                    setView('list');
                    setSelectedItem(null);
                    fetchCatalog();
                }}
            />
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up p-1 pb-20">
            {/* Header - Botón eliminado aquí */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-1 bg-orange-500 rounded-full"></div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">
                            Catálogo de <span className="text-[#1e3a8a]">Precios</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                        Edita los precios del catálogo, ya que son parte de la lógica interna.
                    </p>
                </div>
            </div>

            {/* Barra de Búsqueda y Filtro de Vigencia */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="BUSCAR NOMBRE O CÓDIGO..."
                        className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-2.5 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-500/20"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                    <Filter size={14} className="text-[#1e3a8a]" />
                    <select
                        className="bg-transparent border-none text-[10px] font-black uppercase outline-none cursor-pointer text-slate-600"
                        value={vigenciaFilter}
                        onChange={(e) => setVigenciaFilter(e.target.value)}
                    >
                        <option value="VIGENTE">Solo Vigentes</option>
                        <option value="NO_VIGENTE">No Vigentes</option>
                        <option value="ALL">Ver Todos</option>
                    </select>
                </div>
            </div>

            {/* Grid de Tarjetas Compactas */}
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#1e3a8a]" size={40} /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredData.map((item) => (
                        <div key={item.id} className={`bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-lg transition-all group relative flex flex-col justify-between ${!item.es_vigente && 'bg-slate-50/50'}`}>
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <div className={`p-2 rounded-xl ${item.es_vigente ? 'bg-orange-50 text-orange-600' : 'bg-slate-200 text-slate-500'}`}>
                                        <Tag size={18} />
                                    </div>
                                    <button onClick={() => handleEdit(item)} className="p-1.5 text-slate-300 hover:text-[#1e3a8a] transition-colors">
                                        <Edit3 size={16} />
                                    </button>
                                </div>

                                <div className="space-y-1 mb-3">
                                    <div className="flex flex-wrap gap-1">
                                        <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">
                                            {item.codigo_interno}
                                        </span>
                                        {!item.es_vigente && (
                                            <span className="text-[8px] font-black text-red-500 bg-red-50 px-1.5 py-0.5 rounded uppercase">
                                                Inactivo
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-black text-slate-800 text-sm uppercase italic leading-tight min-h-[2.5rem] flex items-center">
                                        {item.nombre}
                                    </h3>
                                    <p className="text-[9px] text-slate-400 font-medium line-clamp-2 leading-relaxed italic">
                                        Lógica interna vinculada a {item.cantidad_clases_semanal} clases por semana.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                <div>
                                    <span className="text-[8px] font-black text-slate-400 uppercase block tracking-tighter">Precio</span>
                                    <span className="text-sm font-black text-green-600 italic">S/ {parseFloat(item.precio_base).toFixed(2)}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[8px] font-black text-slate-400 uppercase block tracking-tighter">Frecuencia</span>
                                    <span className="text-[9px] font-bold text-slate-600 uppercase">{item.cantidad_clases_semanal} cl/sem</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredData.length === 0 && !loading && (
                <div className="py-20 text-center text-slate-400 font-bold italic uppercase text-xs">
                    No se encontraron conceptos con estos criterios.
                </div>
            )}
        </div>
    );
};

export default AdminCatalogManager;