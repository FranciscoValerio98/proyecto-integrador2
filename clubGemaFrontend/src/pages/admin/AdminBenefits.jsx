import React, { useState, useEffect } from 'react';
import { Search, TicketPercent, MessageSquare, Loader2, Save, Info, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../../interceptors/api';
import { useAuth } from '../../context/AuthContext';
import { API_ROUTES } from '../../constants/apiRoutes';

const AdminBenefits = () => {
    const { userId } = useAuth();
    // 1. ESTADOS DE DATOS
    const [alumnos, setAlumnos] = useState([]);
    const [tiposBeneficio, setTiposBeneficio] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // 2. ESTADOS DE FORMULARIO
    const [selectedAlumnoId, setSelectedAlumnoId] = useState('');
    const [selectedBeneficioId, setSelectedBeneficioId] = useState('');
    const [motivo, setMotivo] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // 3. ESTADOS DE INTELIGENCIA (DETECCIÓN DE DEUDA)
    const [deudaPendiente, setDeudaPendiente] = useState(null);
    const [loadingDeuda, setLoadingDeuda] = useState(false);

    // CARGA INICIAL
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const [resAlumnos, resTipos] = await Promise.all([
                    apiFetch.get(API_ROUTES.USUARIOS.ALUMNOS),
                    apiFetch.get(API_ROUTES.TIPOS_BENEFICIO.BASE)
                ]);

                const dataAlumnos = await resAlumnos.json();
                const dataTipos = await resTipos.json();

                if (resAlumnos.ok) setAlumnos(dataAlumnos.data);
                
                if (resTipos.ok) {
                    const todosLosTipos = dataTipos.data || dataTipos;
                    // 🔥 CORRECCIÓN: Filtramos para que SOLO se guarden los que están activos (true o 1)
                    const tiposActivos = todosLosTipos.filter(tipo => tipo.activo === true || tipo.activo === 1);
                    setTiposBeneficio(tiposActivos);
                }
            } catch (error) {
                toast.error("Error al sincronizar datos");
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    // DETECTAR DEUDAS EN TIEMPO REAL
    const checkDeudaAlumno = async (alumnoId) => {
        try {
            setLoadingDeuda(true);
            setDeudaPendiente(null);
            const response = await apiFetch.get(API_ROUTES.CUENTAS_POR_COBRAR.HISTORIAL(alumnoId));
            if (response.ok) {
                const result = await response.json();
                // Buscamos la primera cuenta pendiente
                const pendiente = result.data.find(c => c.estado === 'PENDIENTE');
                setDeudaPendiente(pendiente);
            }
        } catch (error) {
            console.error("Error al verificar deudas");
        } finally {
            setLoadingDeuda(false);
        }
    };

    // MANEJADOR DE SELECCIÓN
    const handleSelectAlumno = (alum) => {
        setSelectedAlumnoId(alum.id);
        setSearchTerm(`${alum.nombres} ${alum.apellidos}`);
        checkDeudaAlumno(alum.id);
    };

    const filteredAlumnos = alumnos.filter(alum =>
        `${alum.nombres} ${alum.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alum.numero_documento?.includes(searchTerm)
    );

    // ENVÍO INTELIGENTE (CASO 1 VS CASO 2)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAlumnoId || !selectedBeneficioId) {
            return toast.error("Selecciona un alumno y un beneficio");
        }

        try {
            setSubmitting(true);

            // 🧠 SWITCH LÓGICO: ¿Es aplicación directa o reserva futura?
            const isDirectApply = !!deudaPendiente;
            const endpoint = isDirectApply ? API_ROUTES.DESCUENTOS.APLICAR : API_ROUTES.BENEFICIOS_PENDIENTES.BASE;

            // Construimos el payload según lo que espera cada ruta del backend
            const payload = isDirectApply ? {
                cuenta_id: deudaPendiente.id,
                tipo_beneficio_id: parseInt(selectedBeneficioId),
                admin_id: userId, // ID del administrador real obteniéndolo dinámicamente
                motivo: motivo || "Aplicado desde panel de beneficios"
            } : {
                alumno_id: parseInt(selectedAlumnoId),
                tipo_beneficio_id: parseInt(selectedBeneficioId),
                asignado_por: userId,
                motivo: motivo
            };

            const response = await apiFetch.post(endpoint, payload);

            if (response.ok) {
                toast.success(
                    isDirectApply
                        ? "¡Éxito! Descuento aplicado a la deuda actual."
                        : "¡Éxito! Beneficio reservado para la próxima inscripción."
                );

                // Reset del formulario
                setSelectedAlumnoId('');
                setSelectedBeneficioId('');
                setMotivo('');
                setSearchTerm('');
                setDeudaPendiente(null);
            } else {
                const err = await response.json();
                throw new Error(err.message || "Error al procesar");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
            <Loader2 className="animate-spin text-[#1e3a8a]" size={40} />
            <p className="font-black italic animate-pulse">Sincronizando Sistema de Beneficios...</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in-up p-1">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="h-6 w-1 bg-orange-500 rounded-full"></div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                        Panel de <span className="text-[#1e3a8a]">Beneficios Académicos</span>
                    </h1>
                </div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest opacity-70">
                    Administración de Becas y Descuentos Proactivos
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-700">
                                <TicketPercent className="text-[#1e3a8a]" size={20} />
                                <span className="text-[11px] font-black uppercase tracking-widest text-[#1e3a8a]">Asignar Nuevo Incentivo</span>
                            </div>
                            {loadingDeuda && <Loader2 size={16} className="animate-spin text-blue-500" />}
                        </div>

                        <div className="p-6 space-y-6">
                            {/* 1. SELECCIÓN DE ALUMNO */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">1. Buscar Alumno</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="NOMBRE O DOCUMENTO..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            if (!e.target.value) { setSelectedAlumnoId(''); setDeudaPendiente(null); }
                                        }}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 custom-scrollbar">
                                    {filteredAlumnos.length > 0 ? (
                                        filteredAlumnos.map(alum => (
                                            <button
                                                key={alum.id}
                                                type="button"
                                                onClick={() => handleSelectAlumno(alum)}
                                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selectedAlumnoId === alum.id
                                                    ? 'border-[#1e3a8a] bg-blue-50 ring-1 ring-[#1e3a8a]'
                                                    : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 ${selectedAlumnoId === alum.id ? 'bg-[#1e3a8a] text-white' : 'bg-slate-100 text-slate-400'
                                                    }`}>
                                                    {alum.nombres.charAt(0)}
                                                </div>
                                                <div className="truncate">
                                                    <p className="text-[11px] font-black text-slate-700 uppercase leading-none mb-1 truncate">
                                                        {alum.nombres} {alum.apellidos}
                                                    </p>
                                                    <p className="text-[9px] text-slate-400 font-bold">{alum.numero_documento}</p>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-10 text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase italic">No se encontraron coincidencias</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* BANNER DINÁMICO DE INTELIGENCIA */}
                            {selectedAlumnoId && !loadingDeuda && (
                                <div className={`p-4 rounded-2xl border-2 animate-fade-in-up flex gap-4 ${deudaPendiente
                                    ? 'bg-orange-50 border-orange-200'
                                    : 'bg-blue-50 border-blue-200'
                                    }`}>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${deudaPendiente ? 'bg-orange-500 text-white' : 'bg-[#1e3a8a] text-white'
                                        }`}>
                                        {deudaPendiente ? <AlertCircle size={24} /> : <Clock size={24} />}
                                    </div>
                                    <div>
                                        <h5 className={`text-xs font-black uppercase tracking-tight ${deudaPendiente ? 'text-orange-800' : 'text-blue-900'}`}>
                                            {deudaPendiente ? 'DEUDA ACTIVA DETECTADA' : 'SIN DEUDAS: MODO RESERVA'}
                                        </h5>
                                        <p className="text-[10px] font-bold text-slate-600 leading-tight mt-1 uppercase italic">
                                            {deudaPendiente
                                                ? `Tiene una mensualidad de S/ ${deudaPendiente.monto_final}. Se aplicará ahora.`
                                                : 'El descuento se activará automáticamente en su próxima inscripción.'
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* 2. DATOS DEL BENEFICIO */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">2. Tipo de Beneficio</label>
                                    <select
                                        value={selectedBeneficioId}
                                        onChange={(e) => setSelectedBeneficioId(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer shadow-sm"
                                    >
                                        <option value="">SELECCIONA DESCUENTO...</option>
                                        {tiposBeneficio.map(tipo => (
                                            <option key={tipo.id} value={tipo.id}>
                                                {tipo.nombre} ({tipo.es_porcentaje ? `${tipo.valor_por_defecto}%` : `S/ ${tipo.valor_por_defecto}`})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">3. Motivo del Incentivo</label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-4 top-3.5 text-slate-400" size={16} />
                                        <textarea
                                            placeholder="EJ. BECA POR EXCELENCIA..."
                                            value={motivo}
                                            onChange={(e) => setMotivo(e.target.value)}
                                            rows="1"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500/10 min-h-[46px] resize-none shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ACCIÓN */}
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting || !selectedAlumnoId}
                                className={`flex items-center gap-2 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 ${deudaPendiente ? 'bg-orange-600 hover:bg-orange-700' : 'bg-[#1e3a8a] hover:bg-[#0f172a]'
                                    }`}
                            >
                                {submitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                {deudaPendiente ? 'Aplicar a Deuda Ahora' : 'Confirmar Reserva Futura'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sidebar Gema */}
                <div className="space-y-6">
                    <div className="bg-[#0f172a] p-8 rounded-[2.5rem] text-white shadow-2xl border border-white/10 relative overflow-hidden group">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-500/10 rounded-full blur-[80px] group-hover:bg-orange-500/20 transition-all duration-700"></div>
                        <h4 className="font-black uppercase italic tracking-tighter text-xl mb-6 flex items-center gap-3">
                            <Info size={24} className="text-orange-500" />
                            Guía <span className="text-orange-500">Inteligente</span>
                        </h4>
                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <div className="w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center shrink-0 text-orange-500 font-black text-xs">01</div>
                                <p className="text-[10px] font-bold text-white/70 leading-relaxed uppercase">
                                    Si el cuadro es <span className="text-orange-400">Naranja</span>, el alumno tiene deudas. El descuento se aplica de inmediato.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-400 font-black text-xs">02</div>
                                <p className="text-[10px] font-bold text-white/70 leading-relaxed uppercase">
                                    Si el cuadro es <span className="text-blue-400">Azul</span>, el sistema guarda el beneficio para el siguiente mes.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBenefits;