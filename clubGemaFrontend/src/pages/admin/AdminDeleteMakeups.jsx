import React, { useState, useEffect, useMemo } from 'react';
import { 
    Trash2, Search, User, Calendar, AlertTriangle, 
    Loader2, Filter, History, MapPin, ChevronDown, Stethoscope, ChevronRight
} from 'lucide-react';
import { apiFetch } from "../../interceptors/api";
import { API_ROUTES } from "../../constants/apiRoutes";
import toast from 'react-hot-toast';
import { format, addMinutes } from 'date-fns'; 

const AdminDeleteMakeups = () => {
    const [recuperaciones, setRecuperaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [openSections, setOpenSections] = useState({}); // Para Sedes
    const [openAlumnos, setOpenAlumnos] = useState({});   // Para Alumnos

    useEffect(() => { fetchRecuperaciones(); }, []);

    const fetchRecuperaciones = async () => {
        try {
            setLoading(true);
            const response = await apiFetch.get(API_ROUTES.RECUPERACIONES.LISTAR_DEPURACION);
            const json = await response.json();
            setRecuperaciones(json.data || []);
        } catch (error) {
            toast.error("Error al cargar datos");
        } finally {
            setLoading(false);
        }
    };

    const formatLocalDate = (dateString) => {
        if (!dateString) return '---';
        const date = new Date(dateString);
        const adjustedDate = addMinutes(date, date.getTimezoneOffset());
        return format(adjustedDate, 'dd/MM/yyyy');
    };

    const handleDelete = async (id, nombre) => {
        if (!window.confirm(`¿Eliminar registro de ${nombre}?`)) return;
        try {
            await apiFetch.delete(API_ROUTES.RECUPERACIONES.ELIMINAR(id));
            toast.success("Eliminado");
            setRecuperaciones(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    const toggleSection = (sede) => {
        setOpenSections(prev => ({ ...prev, [sede]: !prev[sede] }));
    };

    const toggleAlumno = (alumnoId) => {
        setOpenAlumnos(prev => ({ ...prev, [alumnoId]: !prev[alumnoId] }));
    };

    const groupedData = useMemo(() => {
        const filtered = recuperaciones.filter(item => {
            const fullInfo = `${item.alumnos?.usuarios?.nombres} ${item.alumnos?.usuarios?.apellidos}`.toLowerCase();
            return fullInfo.includes(searchTerm.toLowerCase());
        });

        return filtered.reduce((acc, current) => {
            const sedeNombre = current.horarios_clases?.canchas?.sedes?.nombre || "RECUPERACIONES NO PROGRAMADAS";
            if (!acc[sedeNombre]) acc[sedeNombre] = {};
            
            const alumnoId = current.alumno_id;
            if (!acc[sedeNombre][alumnoId]) {
                acc[sedeNombre][alumnoId] = {
                    nombre: `${current.alumnos?.usuarios?.nombres} ${current.alumnos?.usuarios?.apellidos}`,
                    tickets: []
                };
            }
            acc[sedeNombre][alumnoId].tickets.push(current);
            return acc;
        }, {});
    }, [recuperaciones, searchTerm]);

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
    );

    return (
        <div className="p-4 max-w-6xl mx-auto space-y-4 pb-20">
            {/* Header */}
            <div className="bg-slate-900 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4 border-b-4 border-orange-500">
                <div className="flex items-center gap-4">
                    <div className="bg-orange-500 p-3 rounded-2xl text-white shadow-lg">
                        <History size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">Depuración Maestra</h1>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Gema Academy • Control de Registros</p>
                    </div>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                        type="text" 
                        placeholder="Buscar alumno..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                </div>
            </div>

            {/* Listado */}
            <div className="space-y-3">
                {Object.entries(groupedData).map(([sede, alumnosGroup]) => (
                    <div key={sede} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                        <button 
                            onClick={() => toggleSection(sede)}
                            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <MapPin size={18} className={sede.includes("NO PROGRAMADAS") ? 'text-red-400' : 'text-orange-500'} />
                                <h2 className="text-sm font-black text-slate-700 uppercase italic">{sede}</h2>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg">
                                    {Object.keys(alumnosGroup).length} alumnos
                                </span>
                            </div>
                            <ChevronDown className={`text-slate-300 transition-transform ${openSections[sede] ? 'rotate-180' : ''}`} size={20} />
                        </button>

                        {openSections[sede] && (
                            <div className="p-2 bg-slate-50/30 space-y-1 border-t border-slate-50">
                                {Object.entries(alumnosGroup).map(([alumnoId, data]) => (
                                    <div key={alumnoId} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                                        {/* Botón Desplegable del Alumno */}
                                        <button 
                                            onClick={() => toggleAlumno(alumnoId)}
                                            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-lg ${openAlumnos[alumnoId] ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                                                    <User size={14} />
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">
                                                        {data.nombre}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-300 uppercase">ID: {alumnoId}</span>
                                                </div>
                                                <span className="text-[9px] font-black px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded-md">
                                                    {data.tickets.length} registros
                                                </span>
                                            </div>
                                            <ChevronRight className={`text-slate-300 transition-transform duration-200 ${openAlumnos[alumnoId] ? 'rotate-90' : ''}`} size={16} />
                                        </button>

                                        {/* Tabla Desplegable */}
                                        {openAlumnos[alumnoId] && (
                                            <div className="p-3 pt-0 animate-in slide-in-from-top-2 duration-200">
                                                <div className="overflow-hidden border border-slate-50 rounded-xl">
                                                    <table className="w-full text-left border-collapse bg-white">
                                                        <thead className="bg-slate-50 text-[8px] uppercase font-black text-slate-400">
                                                            <tr>
                                                                <th className="px-4 py-2">Faltó el</th>
                                                                <th className="px-4 py-2">Recupera</th>
                                                                <th className="px-4 py-2">Tipo</th>
                                                                <th className="px-4 py-2 text-center">Estado</th>
                                                                <th className="px-4 py-2 text-right">Acción</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-50">
                                                            {data.tickets.map((recu) => (
                                                                <tr key={recu.id} className="hover:bg-slate-50/50 transition-colors text-[10px]">
                                                                    <td className="px-4 py-2 font-bold text-slate-600">
                                                                        {formatLocalDate(recu.fecha_falta)}
                                                                    </td>
                                                                    <td className={`px-4 py-2 font-medium ${recu.fecha_programada ? 'text-blue-600' : 'text-slate-300 italic'}`}>
                                                                        {formatLocalDate(recu.fecha_programada)}
                                                                    </td>
                                                                    <td className="px-4 py-2">
                                                                        {recu.es_por_lesion ? (
                                                                            <div className="flex items-center gap-1 text-red-500 font-bold uppercase text-[8px]">
                                                                                <Stethoscope size={10} /> Médico
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-slate-400 uppercase text-[8px] font-bold">Falta Común</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-2 text-center">
                                                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-tighter ${
                                                                            recu.estado === 'VENCIDA' ? 'bg-red-100 text-red-600' :
                                                                            recu.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-600' : 
                                                                            'bg-emerald-100 text-emerald-600'
                                                                        }`}>
                                                                            {recu.estado}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-2 text-right">
                                                                        <button 
                                                                            onClick={() => handleDelete(recu.id, data.nombre)}
                                                                            className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                                                                        >
                                                                            <Trash2 size={12} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDeleteMakeups;