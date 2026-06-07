import React, { useState, useEffect, useMemo } from 'react';
import { Search, AlertCircle, Loader2, Info, UserCircle } from 'lucide-react';
import { apiFetch } from "../../interceptors/api";
import { API_ROUTES } from "../../constants/apiRoutes";
import { format, isPast, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

const DiaCorte = () => {
    const [alumnos, setAlumnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('todos');

    useEffect(() => {
        fetchAlumnosCorte();
    }, []);

    const fetchAlumnosCorte = async () => {
        try {
            setLoading(true);
            const response = await apiFetch.get(API_ROUTES.ALUMNOS.DIA_CORTE_COORDINADOR);
            const json = await response.json();
            setAlumnos(json.data || []);
        } catch (error) {
            toast.error("Error al cargar lista de cortes");
        } finally {
            setLoading(false);
        }
    };

    const filteredAlumnos = useMemo(() => {
        const searchClean = searchTerm.trim().toLowerCase();

        const resultado = alumnos.filter(alumno => {
            const nombreCompleto = (alumno.nombre_completo || "").toLowerCase();
            const dni = (alumno.dni || "").toString();
            const palabrasBusqueda = searchClean.split(/\s+/);

            const coincideBusqueda = palabrasBusqueda.every(palabra =>
                nombreCompleto.includes(palabra) || dni.includes(palabra)
            );

            // 🛡️ REGLA DE ORO: Usamos la fecha que viene del BACKEND
            // Tomamos la fecha_corte de la inscripción principal enviada por el service
            const fechaCorteRaw = alumno.fecha_corte_principal;
            const fechaCorte = fechaCorteRaw ? new Date(fechaCorteRaw) : null;

            const vencido = fechaCorte && isPast(fechaCorte) && !isToday(fechaCorte);
            const esHoy = fechaCorte && isToday(fechaCorte);

            let coincideEstado = true;
            if (filterStatus === 'vencidos') coincideEstado = vencido;
            if (filterStatus === 'hoy') coincideEstado = esHoy;

            return coincideBusqueda && coincideEstado;
        });

        return resultado.sort((a, b) => {
            const fechaA = a.fecha_corte_principal ? new Date(a.fecha_corte_principal) : null;
            const fechaB = b.fecha_corte_principal ? new Date(b.fecha_corte_principal) : null;

            if (!fechaA) return 1;
            if (!fechaB) return -1;

            return fechaB - fechaA;
        });

    }, [alumnos, searchTerm, filterStatus]);

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
    );

    return (
        <div className="p-6 space-y-6 max-w-[98%] mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-4 rounded-[1.5rem] text-white shadow-lg shadow-blue-100">
                        <UserCircle size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Gestión de Alumnos</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Corte de ciclo: 30 días (Sincronizado con Servidor)</p>
                    </div>
                </div>

                <div className="flex flex-1 max-w-4xl gap-3 w-full">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por DNI, Nombre o Apellido..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-slate-900 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none shadow-xl cursor-pointer hover:bg-slate-800 transition-all"
                    >
                        <option value="todos">Todos los Alumnos</option>
                        <option value="vencidos">Ciclo Realizado</option>
                        <option value="hoy">Vencen Hoy</option>
                    </select>
                </div>
            </div>

            {/* Banner Informativo */}
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3">
                <Info size={18} className="text-amber-600 shrink-0" />
                <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">
                    Nota: El sistema no considera días de gracia. Los cortes son procesados automáticamente cada 30 días.
                </p>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Datos del Alumno</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">Nro Documento</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">Sede / Horario</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">Fecha Corte</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">Estado de Ciclo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredAlumnos.map((alumno) => {
                                // Usamos los datos procesados que vienen del mapeo del Service
                                const principal = alumno.contratos?.[0];
                                const fechaCorte = alumno.fecha_corte_principal ? new Date(alumno.fecha_corte_principal) : null;
                                const vencido = fechaCorte && isPast(fechaCorte) && !isToday(fechaCorte);
                                const esHoy = fechaCorte && isToday(fechaCorte);

                                return (
                                    <tr key={alumno.id} className="hover:bg-slate-50/80 transition-all text-center group">
                                        <td className="px-8 py-6 text-left">
                                            <span className="text-xs font-black text-slate-700 uppercase italic group-hover:text-blue-600 transition-colors">
                                                {alumno.nombre_completo}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[11px] font-bold text-slate-500 tabular-nums bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                {alumno.dni || "S/D"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-[10px] font-black text-slate-600 uppercase">
                                                    {principal?.sede || 'Sin Sede'}
                                                </span>
                                                {alumno.contratos && alumno.contratos.length > 0 ? (
                                                    alumno.contratos
                                                        .map(c => c.horario)
                                                        .filter(Boolean)
                                                        .filter((h, i, arr) => arr.indexOf(h) === i)
                                                        .map((horario, index) => (
                                                            <span
                                                                key={index}
                                                                className="text-[8px] text-slate-400 uppercase font-bold"
                                                            >
                                                                {horario}
                                                            </span>
                                                        ))
                                                ) : (
                                                    <span className="text-[8px] text-slate-400 uppercase font-bold">
                                                        Sin Horario
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex flex-col items-center px-4 py-2 rounded-2xl border ${vencido ? 'border-slate-100 bg-slate-50' : 'border-emerald-100 bg-emerald-50'}`}>
                                                <span className={`text-xs font-black ${vencido ? 'text-slate-800' : 'text-emerald-500'}`}>
                                                    {fechaCorte ? format(fechaCorte, "dd 'de' MMMM", { locale: es }) : '---'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest inline-block w-32 ${vencido ? 'bg-slate-500 text-white shadow-lg shadow-slate-200' :
                                                esHoy ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' :
                                                    'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                                                }`}>
                                                {vencido ? 'Ciclo Realizado' : esHoy ? 'Vence Hoy' : 'Ciclo al día'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredAlumnos.length === 0 && (
                <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                    <AlertCircle className="mx-auto text-slate-200 mb-4" size={56} />
                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No se encontraron alumnos bajo ese criterio</p>
                </div>
            )}
        </div>
    );
};

export default DiaCorte;