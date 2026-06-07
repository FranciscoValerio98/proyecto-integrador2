import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, Calendar, MapPin, User, Home, Clock, Plus, Trash2 } from 'lucide-react';
import { apiFetch } from '../../interceptors/api';
import toast from 'react-hot-toast';
import { API_ROUTES } from '../../constants/apiRoutes';

const AdminSchedule = ({ onBack, initialData }) => {
    const isEdit = !!initialData;
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);

    const [sedes, setSedes] = useState([]);
    const [canchas, setCanchas] = useState([]);
    const [coordinadores, setCoordinadores] = useState([]);
    const [niveles, setNiveles] = useState([]);

    const [commonData, setCommonData] = useState({
        sede_id: initialData?.cancha?.sede?.id?.toString() || '',
        cancha_id: initialData?.cancha?.id?.toString() || '',
        coordinador_id: initialData?.coordinador?.id?.toString() || '',
        nivel_id: initialData?.nivel?.id?.toString() || '',
        capacidad_max: initialData?.capacidad_max || 20
    });

    const [bloques, setBloques] = useState(
        isEdit
            ? [{
                id: initialData.id,
                dia_semana: initialData.dia_semana?.toString() || '',
                hora_inicio: initialData.hora_inicio ? initialData.hora_inicio.substring(0, 5) : '',
                hora_fin: initialData.hora_fin ? initialData.hora_fin.substring(0, 5) : ''
            }]
            : [{ id: Date.now(), dia_semana: '', hora_inicio: '', hora_fin: '' }]
    );

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setFetchingData(true);
                const [resSedes, resCoordinadores, resNiveles] = await Promise.all([
                    apiFetch.get(API_ROUTES.SEDES.BASE),
                    apiFetch.get(API_ROUTES.USUARIOS.COORDINADORES),
                    apiFetch.get(API_ROUTES.NIVELES.BASE)
                ]);

                if (resSedes.ok) setSedes((await resSedes.json()).data || []);
                if (resCoordinadores.ok) setCoordinadores((await resCoordinadores.json()).data || []);
                if (resNiveles.ok) setNiveles((await resNiveles.json()).data || []);

                const sId = initialData?.cancha?.sede?.id || initialData?.sede_id;
                if (isEdit && sId) {
                    const resCanchas = await apiFetch.get(API_ROUTES.SEDES.BY_ID(sId));
                    if (resCanchas.ok) {
                        const json = await resCanchas.json();
                        setCanchas(json.data?.canchas || json.canchas || []);
                    }
                }
            } catch (error) {
                toast.error("Error al cargar datos");
            } finally {
                setFetchingData(false);
            }
        };
        loadInitialData();
    }, [isEdit, initialData]);

    useEffect(() => {
        if (fetchingData || !commonData.sede_id) return;
        const loadCanchas = async () => {
            const res = await apiFetch.get(API_ROUTES.SEDES.BY_ID(commonData.sede_id));
            if (res.ok) {
                const json = await res.json();
                setCanchas(json.data?.canchas || json.canchas || []);
            }
        };
        loadCanchas();
    }, [commonData.sede_id]);

    const addBloque = () => {
        setBloques([...bloques, { id: Date.now(), dia_semana: '', hora_inicio: '', hora_fin: '' }]);
    };

    const removeBloque = (id) => {
        if (bloques.length > 1) {
            setBloques(bloques.filter(b => b.id !== id));
        } else {
            toast.error("Debes mantener al menos un horario");
        }
    };

    const updateBloque = (id, field, value) => {
        setBloques(bloques.map(b => b.id === id ? { ...b, [field]: value } : b));
    };

    const handleSubmit = async () => {
        if (!commonData.cancha_id || !commonData.nivel_id) {
            return toast.error("Por favor completa los campos obligatorios");
        }

        setLoading(true);
        try {
            const promesas = bloques.map(bloque => {
                const payload = {
                    cancha_id: Number(commonData.cancha_id),
                    coordinador_id: commonData.coordinador_id ? Number(commonData.coordinador_id) : null,
                    nivel_id: Number(commonData.nivel_id),
                    capacidad_max: Number(commonData.capacidad_max),
                    dia_semana: Number(bloque.dia_semana),
                    hora_inicio: bloque.hora_inicio,
                    hora_fin: bloque.hora_fin
                };

                return isEdit
                    ? apiFetch.put(API_ROUTES.HORARIOS.BY_ID(bloque.id), payload)
                    : apiFetch.post(API_ROUTES.HORARIOS.BASE, payload);
            });
            const resultados = await Promise.all(promesas);
            if (resultados.every(res => res.ok)) {
                toast.success(isEdit ? "Horario actualizado" : "Horarios registrados");
                onBack();
            } else {
                const err = await resultados[0].json();
                toast.error(err.message || "Error en la operación");
            }
        } catch (e) { toast.error("Error de conexión"); } finally { setLoading(false); }
    };

    if (fetchingData) return (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
    );

    return (
        <div className="space-y-6 animate-fade-in-up p-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all text-slate-600">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-black italic uppercase tracking-tight">
                        {isEdit ? 'Editar' : 'Programar'} <span className="text-[#1e3a8a]">Clases</span>
                    </h1>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading || !commonData.cancha_id}
                    className="bg-gradient-to-r from-[#1e3a8a] to-[#0f172a] hover:from-orange-500 hover:to-orange-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 shadow-lg shadow-blue-900/20"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {isEdit ? 'Guardar Cambios' : 'Finalizar Programación'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-[#f8fafc] flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-[#1e3a8a] rounded-lg"><Home size={20} /></div>
                            <h3 className="font-black text-[#1e3a8a] uppercase tracking-wider text-sm">Asignación de Espacio</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Sede</label>
                                <select
                                    value={commonData.sede_id}
                                    onChange={(e) => setCommonData({ ...commonData, sede_id: e.target.value, cancha_id: '' })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option value="">Seleccione Sede</option>
                                    {sedes.map(s => <option key={s.id} value={s.id.toString()}>{s.nombre}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Cancha</label>
                                <div className="relative">
                                    <MapPin size={14} className="absolute left-4 top-3.5 text-slate-400" />
                                    <select
                                        value={commonData.cancha_id}
                                        onChange={(e) => setCommonData({ ...commonData, cancha_id: e.target.value })}
                                        disabled={!commonData.sede_id}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                                    >
                                        <option value="">Seleccione Cancha</option>
                                        {canchas.map(c => <option key={c.id} value={c.id.toString()}>{c.nombre}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Aforo</label>
                                <input
                                    type='number'
                                    min={0}
                                    step={1}
                                    value={commonData.capacidad_max}
                                    onChange={(e) => setCommonData({ ...commonData, capacidad_max: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-[#f8fafc] flex items-center gap-3">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><User size={20} /></div>
                            <h3 className="font-black text-[#1e3a8a] uppercase tracking-wider text-sm">Personal y Nivel</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Coordinador</label>
                                <select
                                    value={commonData.coordinador_id || ''} // Aseguramos que si es null, muestre la opción vacía
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setCommonData({
                                            ...commonData,
                                            coordinador_id: val === "" ? null : val
                                        });
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                >
                                    <option value="">Seleccione Coordinador</option>
                                    {coordinadores.map(p => (
                                        <option key={p.id} value={p.id.toString()}>
                                            {p.nombre_completo || `${p.nombres} ${p.apellidos}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nivel</label>
                                <select
                                    value={commonData.nivel_id}
                                    onChange={(e) => setCommonData({ ...commonData, nivel_id: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                >
                                    <option value="">Seleccione Nivel</option>
                                    {niveles.map(n => <option key={n.id} value={n.id.toString()}>{n.nombre}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[500px]">
                        <div className="p-6 border-b border-slate-100 bg-[#f8fafc] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-[#1e3a8a] rounded-lg"><Clock size={20} /></div>
                                <h3 className="font-black text-[#1e3a8a] uppercase tracking-wider text-sm">Horarios</h3>
                            </div>
                            {/* BOTÓN PLUS VISIBLE SIEMPRE */}
                            <button
                                onClick={addBloque}
                                className="p-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md shadow-orange-200"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                            {bloques.map((bloque, index) => (
                                <div key={bloque.id} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 relative group hover:bg-white hover:border-blue-100 transition-all">
                                    {bloques.length > 1 && (
                                        <button
                                            onClick={() => removeBloque(bloque.id)}
                                            className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Día de la semana</label>
                                        <select
                                            value={bloque.dia_semana}
                                            onChange={(e) => updateBloque(bloque.id, 'dia_semana', e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-[#1e3a8a]"
                                        >
                                            <option value="">Seleccionar día...</option>
                                            <option value="1">Lunes</option><option value="2">Martes</option>
                                            <option value="3">Miércoles</option><option value="4">Jueves</option>
                                            <option value="5">Viernes</option><option value="6">Sábado</option>
                                            <option value="7">Domingo</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Hora Inicio</label>
                                            <input type="time" value={bloque.hora_inicio} onChange={(e) => updateBloque(bloque.id, 'hora_inicio', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-[#1e3a8a]" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Hora Fin</label>
                                            <input type="time" value={bloque.hora_fin} onChange={(e) => updateBloque(bloque.id, 'hora_fin', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-[#1e3a8a]" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] p-6 rounded-3xl text-white shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="font-black uppercase italic tracking-tighter text-xl mb-2 text-orange-500">Resumen</h4>
                            <div className="space-y-2 opacity-80 text-[10px] font-bold uppercase">
                                <p className="flex justify-between border-b border-white/10 pb-1">Sede: <span className="text-white">{sedes.find(s => s.id.toString() === commonData.sede_id)?.nombre || '---'}</span></p>
                                <p className="flex justify-between border-b border-white/10 pb-1">Sesiones: <span className="text-white">{bloques.length} bloque(s)</span></p>
                                <p className="flex justify-between">Nivel: <span className="text-white">{niveles.find(n => n.id.toString() === commonData.nivel_id)?.nombre || '---'}</span></p>
                            </div>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-500">
                            <Calendar size={120} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSchedule;