import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, Loader2, Save, ArrowRightLeft, CheckSquare, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../../interceptors/api';
import { useAuth } from '../../context/AuthContext';

const diasSemana = (dia) => {
    let nombreDia;
    switch (dia) {
        case 1: nombreDia = 'Lunes';
            break;
        case 2: nombreDia = 'Martes';
            break;
        case 3: nombreDia = 'Miércoles';
            break;
        case 4: nombreDia = 'Jueves';
            break;
        case 5: nombreDia = 'Viernes';
            break;
        case 6: nombreDia = 'Sábado';
            break;
        case 7: nombreDia = 'Domingo';
            break;
        default: return "Nro de día inválido";
    }
    return nombreDia;
}

const ChangeLevelStudent = ({ alumno, onBack }) => {
    const [horariosActuales, setHorariosActuales] = useState([]);
    const [selectedHorarioActual, setSelectedHorarioActual] = useState(null);
    const [loadingActuales, setLoadingActuales] = useState(true);

    const [horariosDisponibles, setHorariosDisponibles] = useState([]);
    const [selectedHorarioNuevo, setSelectedHorarioNuevo] = useState(null);
    const [loadingDisponibles, setLoadingDisponibles] = useState(false);

    const [filtroSede, setFiltroSede] = useState('');
    const [filtroNivel, setFiltroNivel] = useState('');
    const [saving, setSaving] = useState(false);
    const { user } = useAuth();

    const fetchHorariosAlumno = async () => {
        try {
            setLoadingActuales(true);
            const response = await apiFetch.get(`/inscripciones/alumno-no-finalizadas/${alumno.id}`);
            if (response.ok) {
                const result = await response.json();
                setHorariosActuales(result.data);
            }
        } catch (error) {
            toast.error("Error al cargar los horarios del alumno");
            console.error(error);
        } finally {
            setLoadingActuales(false);
        }
    };

    useEffect(() => {
        if (alumno.id) {
            fetchHorariosAlumno();
        }
    }, [alumno.id]);

    useEffect(() => {
        const fetchHorariosDisponibles = async () => {
            try {
                setLoadingDisponibles(true);
                const response = await apiFetch.get(`/horarios`);
                if (response.ok) {
                    const result = await response.json();
                    setHorariosDisponibles(result.data);
                }

            } catch (error) {
                toast.error("Error al cargar los horarios disponibles");
                console.error(error);
            } finally {
                setLoadingDisponibles(false);
            }
        };

        fetchHorariosDisponibles();
    }, []);

    const sedesUnicas = [...new Set(horariosDisponibles.map(h => h.cancha?.sede?.nombre).filter(Boolean))];
    const nivelesUnicos = [...new Set(horariosDisponibles.map(h => h.nivel?.nombre).filter(Boolean))];

    const horariosFiltrados = horariosDisponibles.filter(horario => {
        const matchSede = filtroSede === '' || horario.cancha?.sede?.nombre === filtroSede;
        const matchNivel = filtroNivel === '' || horario.nivel?.nombre === filtroNivel;
        return matchSede && matchNivel;
    });

    const confirmarRecuperacion = () => {
        if (!selectedHorarioActual) {
            toast.error("Por favor selecciona el horario actual que deseas cambiar");
            return;
        }
        if (!selectedHorarioNuevo) {
            toast.error("Por favor selecciona el horario destino");
            return;
        }
        toast((t) => (
            <div className="flex flex-col gap-4 p-2 w-full">
                <div className="text-center pb-2 border-b border-slate-100">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Confirmar Cambio de Horario</span>
                </div>

                <div className="grid grid-cols-2 gap-4 divide-x divide-slate-200">

                    <div className="flex flex-col gap-2 pr-2">
                        <span className="text-[10px] font-black text-[#1e3a8a] uppercase tracking-widest">Horario Actual</span>
                        <div className="flex flex-col gap-1.5 text-xs">
                            <p className="flex flex-col">
                                <span className="text-[9px] text-[#1e3a8a] uppercase">Sede</span>
                                <span className="font-bold text-slate-700">{selectedHorarioActual.horarios_clases?.canchas?.sedes?.nombre}</span>
                            </p>
                            <p className="flex flex-col">
                                <span className="text-[9px] text-[#1e3a8a] uppercase">Nivel</span>
                                <span className="font-bold text-slate-700">{selectedHorarioActual.horarios_clases?.niveles_entrenamiento?.nombre}</span>
                            </p>
                            <p className="flex flex-col">
                                <span className="text-[9px] text-[#1e3a8a] uppercase">Día y Hora</span>
                                <span className="font-bold text-slate-700">
                                    {diasSemana(selectedHorarioActual.horarios_clases?.dia_semana)} <br />
                                    <span className="font-normal text-slate-800">{selectedHorarioActual.horarios_clases?.hora_inicio.slice(11, 16)} - {selectedHorarioActual.horarios_clases?.hora_fin.slice(11, 16)}</span>
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 pl-4">
                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Horario Destino</span>
                        <div className="flex flex-col gap-1.5 text-xs">
                            <p className="flex flex-col">
                                <span className="text-[9px] text-orange-600 uppercase">Sede</span>
                                <span className="font-bold text-slate-800">{selectedHorarioNuevo.cancha?.sede?.nombre}</span>
                            </p>
                            <p className="flex flex-col">
                                <span className="text-[9px] text-orange-600 uppercase">Nivel</span>
                                <span className="font-bold text-slate-800">{selectedHorarioNuevo.nivel?.nombre}</span>
                            </p>
                            <p className="flex flex-col">
                                <span className="text-[9px] text-orange-600 uppercase">Día y Hora</span>
                                <span className="font-bold text-slate-800">
                                    {diasSemana(selectedHorarioNuevo.dia_semana)} <br />
                                    <span className="font-normal text-slate-800">{selectedHorarioNuevo.hora_inicio} - {selectedHorarioNuevo.hora_fin}</span>
                                </span>
                            </p>
                        </div>
                    </div>

                </div>

                <div className="flex gap-2 mt-2 pt-3 border-t border-slate-100">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            handleConfirmarCambio();
                        }}
                        className="flex-1 bg-orange-500 text-white text-[10px] font-black uppercase py-2.5 rounded-xl hover:bg-orange-600 transition-colors shadow-sm"
                    >
                        Confirmar
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="flex-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase py-2.5 rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        ), {
            duration: Infinity,
            position: 'top-center',
            style: {
                minWidth: '340px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '16px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
            },
        });
    };

    const handleConfirmarCambio = async () => {
        try {
            setSaving(true);
            const response = await apiFetch.put(`/inscripciones/horario-inscripcion`, {
                alumnoId: selectedHorarioActual.alumno_id,
                inscripcionId: selectedHorarioActual.id,
                horarioId: selectedHorarioNuevo.id,
                adminId: user.id
            });

            const data = await response.json();
            if (response.ok) {
                toast.success(data.message || "Horario intercambiado correctamente");
                await fetchHorariosAlumno();
                setSelectedHorarioActual(null);
                setSelectedHorarioNuevo(null);
            } else {
                toast.error(data.message || "Error al procesar el cambio");
            }
        } catch (error) {
            toast.error("Error de conexión");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (loadingActuales || loadingDisponibles) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
                <Loader2 className="animate-spin text-[#1e3a8a]" size={40} />
                <p className="font-bold italic animate-pulse">Sincronizando información de horarios...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up p-1">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="group flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-xl hover:border-[#1e3a8a] transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} className="text-slate-600 group-hover:text-[#1e3a8a]" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <div className="h-5 w-1 bg-orange-500 rounded-full"></div>
                            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                Cambio de <span className="text-[#1e3a8a]">Horario</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wide ml-3">
                            Reasignación para: <span className="text-orange-500">{alumno.nombres} {alumno.apellidos}</span>
                        </p>
                    </div>
                </div>

                <button
                    onClick={confirmarRecuperacion}
                    disabled={!selectedHorarioActual || !selectedHorarioNuevo || saving}
                    className="hidden sm:flex items-center gap-2 bg-[#1e3a8a] hover:bg-blue-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Confirmar Cambio
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Horarios Actuales del Alumno */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center font-black">1</div>
                        <div>
                            <h2 className="text-sm font-black uppercase italic tracking-tighter text-slate-800">
                                Horarios del Alumno
                            </h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Seleccione el horario a cambiar</p>
                        </div>
                    </div>

                    {horariosActuales.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                            <AlertCircle size={32} className="text-slate-300 mb-3" />
                            <p className="text-slate-500 font-bold uppercase text-xs text-center tracking-wide">El alumno no tiene horarios activos</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {horariosActuales.map((horario) => (
                                <div
                                    key={horario.id}
                                    onClick={() => setSelectedHorarioActual(horario)}
                                    className={`cursor-pointer border-2 rounded-2xl p-4 transition-all relative overflow-hidden group ${selectedHorarioActual?.id === horario.id
                                        ? 'border-orange-500 bg-orange-50/30'
                                        : 'border-slate-100 hover:border-orange-200 hover:bg-slate-50'
                                        }`}
                                >
                                    {selectedHorarioActual?.id === horario.id && (
                                        <div className="absolute top-4 right-4 text-orange-500">
                                            <CheckSquare size={20} fill="currentColor" className="text-white bg-orange-500 rounded-lg" />
                                        </div>
                                    )}
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${selectedHorarioActual?.id === horario.id ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-600'
                                                }`}>
                                                {horario.horarios_clases.niveles_entrenamiento?.nombre || 'Sin Nivel'}
                                            </span>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${selectedHorarioActual?.id === horario.id ? 'bg-orange-200 text-orange-800' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {horario.horarios_clases.canchas.sedes.nombre || 'Sin Sede'}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 uppercase italic tracking-tight text-base">
                                                {diasSemana(horario.horarios_clases.dia_semana)}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                                                <Clock size={12} />
                                                <span className="text-[11px] font-bold uppercase">{horario.horarios_clases.hora_inicio.slice(11, 16)} - {horario.horarios_clases.hora_fin.slice(11, 16)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Horarios Disponibles */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 relative">
                    {!selectedHorarioActual && (
                        <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                            <ArrowRightLeft size={40} className="text-slate-300 mb-4" />
                            <h3 className="text-slate-800 font-black uppercase tracking-widest text-sm mb-2">Seleccione un horario del alumno</h3>
                        </div>
                    )}

                    <div className="flex items-center gap-3 mb-6">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${selectedHorarioActual ? 'bg-[#1e3a8a] text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
                        <div>
                            <h2 className={`text-sm font-black uppercase italic tracking-tighter ${selectedHorarioActual ? 'text-[#1e3a8a]' : 'text-slate-400'}`}>
                                Horarios Disponibles
                            </h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Seleccione el nuevo horario</p>
                        </div>
                    </div>

                    {/* Contenedor de Filtros */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-400 pr-2 border-r border-slate-200 hidden sm:flex">
                            <Filter size={16} />
                        </div>
                        <select
                            value={filtroSede}
                            onChange={(e) => setFiltroSede(e.target.value)}
                            className="flex-1 bg-white border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-widest rounded-xl px-3 py-2 outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] transition-all cursor-pointer"
                        >
                            <option value="">Todas las Sedes</option>
                            {sedesUnicas.map((sede, idx) => (
                                <option key={idx} value={sede}>{sede}</option>
                            ))}
                        </select>
                        <select
                            value={filtroNivel}
                            onChange={(e) => setFiltroNivel(e.target.value)}
                            className="flex-1 bg-white border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-widest rounded-xl px-3 py-2 outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] transition-all cursor-pointer"
                        >
                            <option value="">Todos los Niveles</option>
                            {nivelesUnicos.map((nivel, idx) => (
                                <option key={idx} value={nivel}>{nivel}</option>
                            ))}
                        </select>
                    </div>

                    {horariosDisponibles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center flex-1 p-8 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                            <AlertCircle size={32} className="text-slate-300 mb-3" />
                            <p className="text-slate-500 font-bold uppercase text-xs text-center tracking-wide">No hay horarios disponibles</p>
                        </div>
                    ) : horariosFiltrados.length === 0 ? (
                        <div className="flex flex-col items-center justify-center flex-1 p-8 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                            <Filter size={32} className="text-slate-300 mb-3" />
                            <p className="text-slate-500 font-bold uppercase text-xs text-center tracking-wide">No hay resultados para estos filtros</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 400px)', minHeight: '300px' }}>

                            {horariosFiltrados.map((horario) => (
                                <div
                                    key={horario.id}
                                    onClick={() => setSelectedHorarioNuevo(horario)}
                                    className={`cursor-pointer border-2 rounded-2xl p-4 transition-all relative overflow-hidden group ${selectedHorarioNuevo?.id === horario.id
                                        ? 'border-[#1e3a8a] bg-blue-50/30'
                                        : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                                        }`}
                                >
                                    {selectedHorarioNuevo?.id === horario.id && (
                                        <div className="absolute top-4 right-4 text-[#1e3a8a]">
                                            <CheckCircle2 size={20} fill="currentColor" className="text-white bg-[#1e3a8a] rounded-full" />
                                        </div>
                                    )}
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${selectedHorarioNuevo?.id === horario.id ? 'bg-[#1e3a8a] text-white' : 'bg-slate-200 text-slate-600'
                                                }`}>
                                                {horario.nivel.nombre || 'Sin Nivel'}
                                            </span>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${selectedHorarioNuevo?.id === horario.id ? 'bg-blue-200 text-blue-900' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {horario.cancha.sede.nombre || 'Sin Sede'}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 uppercase italic tracking-tight text-base">
                                                {diasSemana(horario.dia_semana)}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                                                <Clock size={12} />
                                                <span className="text-[11px] font-bold uppercase">{horario.hora_inicio} - {horario.hora_fin}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Botón flotante para móvil */}
            <div className="sm:hidden mt-6">
                <button
                    onClick={confirmarRecuperacion}
                    disabled={!selectedHorarioActual || !selectedHorarioNuevo || saving}
                    className="w-full flex justify-center items-center gap-2 bg-[#1e3a8a] hover:bg-blue-900 text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Confirmar Cambio
                </button>
            </div>
        </div>
    );
};

export default ChangeLevelStudent;