import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Clock, User, MapPin, Edit3, Trash2, Loader2, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminSchedule from './AdminSchedule';
import { apiFetch } from '../../interceptors/api';
import toast from 'react-hot-toast';
import { API_ROUTES } from '../../constants/apiRoutes';

const AdminSchedulesManager = () => {
    const [view, setView] = useState('list');
    const [horarios, setHorarios] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- ESTADOS DE FILTRO ---
    const [filterDia, setFilterDia] = useState('');
    const [filterSede, setFilterSede] = useState('');
    const [filterCoordinador, setFilterCoordinador] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHorario, setSelectedHorario] = useState(null);

    // --- ESTADO PAGINACIÓN ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const handleEdit = (horario) => {
        setSelectedHorario(horario);
        setView('edit');
    };

    const mapDiaSemana = (dia) => {
        const dias = { 1: 'Lun', 2: 'Mar', 3: 'Mie', 4: 'Jue', 5: 'Vie', 6: 'Sab', 7: 'Dom' };
        return dias[dia] || 'S/D';
    };

    const fetchHorarios = async () => {
        try {
            setLoading(true);
            const response = await apiFetch.get(API_ROUTES.HORARIOS.BASE);
            const result = await response.json();
            if (response.ok) setHorarios(result.data);
        } catch (error) {
            toast.error("Error al conectar con el servidor");
        } finally {
            setLoading(false);
        }
    };
    const handleDelete = (id) => {
        // Usamos toast personalizado en lugar de window.confirm
        toast((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white shadow-2xl rounded-3xl pointer-events-auto flex flex-col ring-1 ring-black/5 overflow-hidden`}>

                {/* Contenido del Modal */}
                <div className="p-6 text-center space-y-3">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-2 transform -rotate-3">
                        <Trash2 size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">¿Eliminar Horario?</h3>
                    <p className="text-xs font-bold text-slate-400">Esta acción no se puede deshacer y liberará la cancha en ese horario.</p>
                </div>

                {/* Botones de Acción */}
                <div className="flex border-t border-slate-100 bg-slate-50">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="flex-1 px-4 py-4 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors uppercase tracking-widest border-r border-slate-100"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id); // Cerramos el modal

                            // Ponemos un toast de carga mientras procesa
                            const loadingToast = toast.loading("Eliminando horario...");

                            try {
                                const res = await apiFetch.delete(`${API_ROUTES.HORARIOS.BASE}/${id}`);
                                if (res.ok) {
                                    toast.success("Horario eliminado correctamente", { id: loadingToast });
                                    fetchHorarios(); // Recargamos la lista
                                } else {
                                    const err = await res.json();
                                    toast.error(err.message || "No se pudo eliminar", { id: loadingToast });
                                }
                            } catch (error) {
                                toast.error("Error de conexión al eliminar", { id: loadingToast });
                            }
                        }}
                        className="flex-1 px-4 py-4 text-xs font-black text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors uppercase tracking-widest"
                    >
                        Sí, Eliminar
                    </button>
                </div>
            </div>
        ), {
            duration: Infinity, // Hace que el modal no se cierre solo hasta que elijas una opción
            id: `delete-modal-${id}` // Evita que se abran múltiples modales iguales
        });
    };

    useEffect(() => {
        if (view === 'list') fetchHorarios();
    }, [view]);

    // --- LÓGICA DE FILTRADO ---
    const filteredHorarios = useMemo(() => {
        return horarios.filter(h => {
            const matchesDia = filterDia === '' || h.dia_semana.toString() === filterDia;
            const matchesSede = filterSede === '' || h.cancha.sede.nombre === filterSede;
            const nombreCoordinador = h.coordinador?.nombre_completo || 'Sin asignar';
            const matchesProf = filterCoordinador === '' || nombreCoordinador === filterCoordinador;
            const matchesSearch = searchTerm === '' ||
                nombreCoordinador.toLowerCase().includes(searchTerm.toLowerCase()) ||
                h.cancha.nombre.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesDia && matchesSede && matchesProf && matchesSearch;
        });
    }, [horarios, filterDia, filterSede, filterCoordinador, searchTerm]);

    // --- LÓGICA DE PAGINACIÓN ---
    const totalPages = Math.ceil(filteredHorarios.length / itemsPerPage);
    const currentData = filteredHorarios.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Obtener opciones únicas para los selects de filtro
    const uniqueSedes = [...new Set(horarios.map(h => h.cancha.sede.nombre))];
    const uniqueCoordinadores = [...new Set(horarios.map(h => h.coordinador.nombre_completo))];

    if (view === 'create') return <AdminSchedule onBack={() => setView('list')} />;
    if (view === 'edit') return <AdminSchedule onBack={() => { setView('list'); setSelectedHorario(null); }} initialData={selectedHorario} />;

    return (
        <div className="space-y-6 animate-fade-in-up p-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-1 bg-orange-500 rounded-full"></div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Panel de <span className="text-[#1e3a8a]">Horarios</span></h1>
                    </div>
                </div>
                <button onClick={() => setView('create')} className="bg-[#1e3a8a] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-orange-500 transition-all group">
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Programar Clase
                </button>
            </div>

            {/* --- BARRA DE FILTROS --- */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>
                <select
                    className="bg-slate-50 border-none rounded-2xl px-4 py-2 text-xs font-bold outline-none"
                    value={filterDia}
                    onChange={(e) => { setFilterDia(e.target.value); setCurrentPage(1); }}
                >
                    <option value="">Todos los días</option>
                    <option value="1">Lunes</option><option value="2">Martes</option>
                    <option value="3">Miércoles</option><option value="4">Jueves</option>
                    <option value="5">Viernes</option><option value="6">Sábado</option>
                    <option value="7">Domingo</option>
                </select>
                <select
                    className="bg-slate-50 border-none rounded-2xl px-4 py-2 text-xs font-bold outline-none"
                    value={filterSede}
                    onChange={(e) => { setFilterSede(e.target.value); setCurrentPage(1); }}
                >
                    <option value="">Todas las Sedes</option>
                    {uniqueSedes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                    className="bg-slate-50 border-none rounded-2xl px-4 py-2 text-xs font-bold outline-none"
                    value={filterCoordinador}
                    onChange={(e) => { setFilterCoordinador(e.target.value); setCurrentPage(1); }}
                >
                    <option value="">Todos los Coordinadores</option>
                    {uniqueCoordinadores.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#1e3a8a]" size={40} /></div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {currentData.length > 0 ? (
                            currentData.map((h) => (
                                <div key={h.id} className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 hover:shadow-xl transition-all group flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-2 py-1 bg-orange-100 text-orange-600 text-[9px] font-black rounded-lg uppercase tracking-wider">
                                                {mapDiaSemana(h.dia_semana)}
                                            </span>
                                            {/* Botones de acción siempre visibles en móvil, hover en desktop */}
                                            <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(h)}
                                                    className="p-2 text-slate-400 hover:text-[#1e3a8a] bg-slate-50 md:bg-transparent rounded-lg transition-colors"
                                                >
                                                    <Edit3 size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(h.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 md:bg-transparent rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="shrink-0 p-3 bg-blue-50 text-[#1e3a8a] rounded-2xl group-hover:bg-[#1e3a8a] group-hover:text-white transition-all duration-300">
                                                <Clock size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-black text-slate-800 text-base md:text-lg italic leading-tight truncate">
                                                    {h.hora_inicio} - {h.hora_fin}
                                                </h3>
                                                <p className="text-[#1e3a8a] text-[10px] font-black uppercase tracking-widest truncate">
                                                    {h.nivel.nombre}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5 pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <User size={14} className="shrink-0 text-orange-500" />
                                            <span className="text-[11px] font-bold uppercase truncate">
                                                {h.coordinador.nombre_completo}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <MapPin size={14} className="shrink-0 text-orange-500" />
                                            <span className="text-[11px] font-bold uppercase truncate" title={`${h.cancha.nombre} (${h.cancha.sede.nombre})`}>
                                                {h.cancha.nombre} <span className="text-[10px] text-slate-400 font-medium">({h.cancha.sede.nombre})</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold italic">No se encontraron horarios con esos filtros.</p>
                            </div>
                        )}
                    </div>

                    {/* --- CONTROLES DE PAGINACIÓN --- */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 pt-6">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                Página {currentPage} de {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminSchedulesManager;