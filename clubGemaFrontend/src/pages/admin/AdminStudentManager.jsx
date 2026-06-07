import React, { useState, useEffect } from 'react';
import {
    Search, Phone, ShieldAlert, ChevronRight, ArrowLeft, Heart, Mail,
    Calendar, User, Fingerprint, Activity, Info, FileText, Loader2,
    MapPin, Zap, RefreshCw, Eye, Stethoscope, Users, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../../interceptors/api';
import { API_ROUTES } from '../../constants/apiRoutes';
import ChangeLevelStudent from '../../components/Admin/ChangeLevelStudent';
import { format, addDays, isPast, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

const AdminStudentsManager = () => {
    const [view, setView] = useState('list');
    const [selectedAlumno, setSelectedAlumno] = useState(null);
    const [alumnos, setAlumnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sedes, setSedes] = useState([]);
    const [selectedSede, setSelectedSede] = useState('');

    // ESTADO PARA EL MODAL DE INSCRIPCIONES MULTIPLES
    const [modalInscripciones, setModalInscripciones] = useState({ isOpen: false, data: null });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchAlumnos = async () => {
        try {
            setLoading(true);
            const url = selectedSede ? `${API_ROUTES.USUARIOS.ALUMNOS}?sede_id=${selectedSede}` : API_ROUTES.USUARIOS.ALUMNOS;
            const response = await apiFetch.get(url);
            const result = await response.json();

            if (response.ok) {
                const formattedData = result.data.map(user => {
                    const alumnoData = user.alumnos || {};
                    const contacto = alumnoData.alumnos_contactos?.[0] || {};
                    const inscripciones = alumnoData.inscripciones || [];
                    const dir = alumnoData.direcciones || {};

                    // 1. LÓGICA DE ESTADOS Y FECHAS
                    const inscripcionesActivas = inscripciones.filter(i => i.estado === 'ACTIVO');

                    let inscripcionesAMostrar = [];
                    let estadoVisual = 'SIN INSCRIPCIÓN';

                    if (inscripcionesActivas.length > 0) {
                        inscripcionesAMostrar = inscripcionesActivas;
                        estadoVisual = 'ACTIVO';
                    } else if (inscripciones.length > 0) {
                        inscripcionesAMostrar = [inscripciones[0]];
                        estadoVisual = inscripciones[0].estado;
                    }

                    // 2. EXTRACCIÓN DE DATOS
                    const sedesNombres = [...new Set(inscripcionesAMostrar.map(i => i.horarios_clases?.canchas?.sedes?.nombre).filter(Boolean))];
                    const nivelesNombres = [...new Set(inscripcionesAMostrar.map(i => i.horarios_clases?.niveles_entrenamiento?.nombre).filter(Boolean))];

                    const ultimaInsc = inscripcionesAMostrar[0];
                    const fCorte = ultimaInsc?.fecha_inscripcion ? addDays(new Date(ultimaInsc.fecha_inscripcion), 30) : null;

                    // 3. HISTORIAL DETALLADO PARA EL POPUP
                    const historialInscripciones = inscripcionesAMostrar.map(insc => {
                        const fCorteCalculada = insc.fecha_inscripcion ? addDays(new Date(insc.fecha_inscripcion), 30) : null;

                        // LÓGICA DE HORARIOS Y DÍAS CORREGIDA 🔥
                        const hc = insc.horarios_clases || {};

                        // Función para extraer la hora exacta ignorando la zona horaria del navegador
                        const formatTime = (timeStr) => {
                            if (!timeStr) return '';
                            // Si viene como ISO "1970-01-01T10:30:00.000Z", cortamos solo "10:30"
                            if (timeStr.includes('T')) {
                                return timeStr.split('T')[1].substring(0, 5);
                            }
                            return timeStr.substring(0, 5);
                        };

                        // Mapa de días que cubre tanto formato JS (0) como formato ISO BD (7)
                        const mapaDias = {
                            0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miércoles',
                            4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo'
                        };

                        const nombreDia = hc.dia_semana !== undefined ? mapaDias[hc.dia_semana] : '';
                        const horaTexto = hc.hora_inicio && hc.hora_fin ? `${formatTime(hc.hora_inicio)} - ${formatTime(hc.hora_fin)}` : '';
                        const horarioCompleto = `${nombreDia} ${horaTexto}`.trim();

                        return {
                            estado: insc.estado,
                            sede: hc.canchas?.sedes?.nombre || 'S/D',
                            nivel: hc.niveles_entrenamiento?.nombre || 'SIN NIVEL',
                            horario: horarioCompleto, // Lo guardamos para pintarlo
                            fechaInscripcion: insc.fecha_inscripcion,
                            fechaCorte: fCorteCalculada,
                            estaVencido: fCorteCalculada ? isPast(fCorteCalculada) : false,
                        };
                    });

                    return {
                        ...user,
                        full_name: `${user.nombres} ${user.apellidos}`,
                        dni: user.numero_documento || '---',
                        telefono: user.telefono_personal || 'S/N',
                        cumpleanos: user.fecha_nacimiento ? format(new Date(user.fecha_nacimiento), "dd 'de' MMM", { locale: es }) : 'S/D',
                        sedes: sedesNombres,
                        niveles: nivelesNombres,
                        fechaCorte: fCorte,
                        estaVencido: fCorte ? isPast(fCorte) : false,
                        estadoVisual: estadoVisual,
                        multiplesActivas: inscripcionesActivas.length > 1,
                        historialInscripciones: historialInscripciones,

                        direccion: {
                            completa: dir.direccion_completa || 'No registrada',
                            distrito: dir.distrito || 'S/D',
                            referencia: dir.referencia || ''
                        },
                        salud: {
                            condiciones: alumnoData.condiciones_medicas || 'Ninguna',
                            seguro: alumnoData.seguro_medico || 'S/N',
                            sangre: alumnoData.grupo_sanguineo || 'S/N',
                            historial: alumnoData.historial || 'Sin observaciones'
                        },
                        contactoEmergencia: {
                            nombre: contacto.nombre_completo || 'No registrado',
                            telefono: contacto.telefono || 'S/N',
                            relacion: contacto.relacion || 'No especificada'
                        }
                    };
                });
                setAlumnos(formattedData);
            }
        } catch (error) {
            toast.error("Error al sincronizar Base Gema");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlumnos();
    }, [selectedSede]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedSede]);

    useEffect(() => {
        const loadSedes = async () => {
            const res = await apiFetch.get(API_ROUTES.SEDES.ACTIVOS);
            const result = await res.json();
            if (res.ok) setSedes(result.data || []);
        };
        loadSedes();
    }, []);

    const filteredAlumnos = alumnos.filter(alum =>
        alum.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alum.dni.includes(searchTerm)
    );

    const currentAlumnos = filteredAlumnos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredAlumnos.length / itemsPerPage);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
            <Loader2 className="animate-spin text-[#1e3a8a]" size={48} />
            <p className="font-black text-[#1e3a8a] text-xs uppercase italic tracking-widest animate-pulse">Consultando Registros...</p>
        </div>
    );

    if (view === 'details' && selectedAlumno) {
        return (
            <div className="space-y-6 animate-fade-in-up p-1">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('list')} className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm">
                        <ArrowLeft size={24} className="text-slate-600" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black uppercase italic text-slate-800 leading-none">Expediente <span className="text-[#1e3a8a]">Gema</span></h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Ficha completa del Alumno</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
                            <div className="w-28 h-28 bg-[#1e3a8a] text-white rounded-3xl flex items-center justify-center font-black text-5xl italic shadow-2xl relative z-10">
                                {selectedAlumno.nombres.charAt(0)}
                            </div>
                            <div className="flex-1 space-y-6 relative z-10 w-full">
                                <div>
                                    <h3 className="text-4xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">{selectedAlumno.full_name}</h3>
                                    <div className="flex gap-2 mt-2">
                                        {selectedAlumno.sedes.map((s, i) => (
                                            <span key={i} className="px-3 py-1 bg-orange-100 text-orange-600 rounded-lg text-[9px] font-black uppercase italic border border-orange-200">{s}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-50 pt-4">
                                    <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase tracking-tighter">
                                        <Fingerprint size={16} className="text-blue-500" /> {selectedAlumno.dni}
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm font-bold lowercase">
                                        <Mail size={16} className="text-blue-500" /> {selectedAlumno.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase tracking-tighter">
                                        <Calendar size={16} className="text-blue-500" /> {selectedAlumno.cumpleanos}
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase tracking-tighter">
                                        <Phone size={16} className="text-blue-500" /> {selectedAlumno.telefono}
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm font-bold tracking-tighter">
                                        <User size={16} className="text-blue-500" /> {selectedAlumno.username || 'Sin nombre de usuario'}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-50">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Dirección Registrada</p>
                                    <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <MapPin size={20} className="text-orange-500 shrink-0 mt-1" />
                                        <div>
                                            <p className="text-sm font-black text-slate-700 uppercase italic leading-tight">
                                                {selectedAlumno.direccion.distrito} <span className="text-slate-300 font-normal mx-2">|</span> {selectedAlumno.direccion.completa}
                                            </p>
                                            {selectedAlumno.direccion.referencia && (
                                                <p className="text-[10px] text-slate-400 mt-1 font-bold italic tracking-wide">Ref: {selectedAlumno.direccion.referencia}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-8 py-5 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[#1e3a8a]">
                                    <Stethoscope size={20} />
                                    <span className="text-[11px] font-black uppercase tracking-widest italic">Información de Salud</span>
                                </div>
                                <span className="bg-[#1e3a8a] text-white text-[8px] font-black px-2 py-1 rounded-md">GRUPO SANGUÍNEO: {selectedAlumno.salud.sangre}</span>
                            </div>
                            <div className="p-8 grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2 italic">Alergias / Condiciones:</p>
                                        <p className="text-sm font-bold text-slate-700 italic leading-relaxed">{selectedAlumno.salud.condiciones}</p>
                                    </div>
                                    <div className="flex justify-between p-5 bg-white border border-slate-100 rounded-3xl">
                                        <span className="text-[9px] font-black text-slate-400 uppercase">Seguro Médico:</span>
                                        <span className="text-sm font-black text-[#1e3a8a] italic uppercase">{selectedAlumno.salud.seguro}</span>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <div className="flex items-center gap-2 mb-2 text-slate-400">
                                        <FileText size={14} />
                                        <p className="text-[9px] font-black uppercase italic">Historial Académico / Deportivo:</p>
                                    </div>
                                    <p className="text-[11px] font-medium text-slate-500 italic leading-relaxed">{selectedAlumno.salud.historial}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-50 rounded-[2.5rem] border border-red-100 p-8 relative overflow-hidden h-fit">
                        <div className="absolute -right-4 -bottom-4 text-red-100 opacity-50">
                            <ShieldAlert size={120} />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3 text-red-600">
                                <Users size={24} />
                                <span className="text-xs font-black uppercase tracking-widest italic">Contacto Emergencia</span>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[9px] font-black text-red-400 uppercase mb-1">Responsable</p>
                                    <p className="text-lg font-black text-red-900 leading-tight uppercase italic">{selectedAlumno.contactoEmergencia.nombre}</p>
                                    <p className="text-[10px] font-bold text-red-600 uppercase italic mt-1">{selectedAlumno.contactoEmergencia.relacion}</p>
                                </div>
                                <div className="pt-4 border-t border-red-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black text-red-400 uppercase mb-1">Teléfono Directo</p>
                                        <p className="text-xl font-black text-red-900 tracking-tighter">{selectedAlumno.contactoEmergencia.telefono}</p>
                                    </div>
                                    <a href={`tel:${selectedAlumno.contactoEmergencia.telefono}`} className="bg-red-600 text-white p-3 rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95">
                                        <Phone size={20} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'cambio_nivel' && selectedAlumno) {
        return <ChangeLevelStudent alumno={selectedAlumno} onBack={() => { setView('list'); fetchAlumnos(); }} />;
    }

    return (
        <div className="space-y-6 animate-fade-in-up p-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Gestión de <span className="text-[#1e3a8a]">Alumnos</span></h1>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Control Maestro de la Academia</p>
                </div>
                <select value={selectedSede} onChange={(e) => setSelectedSede(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-[10px] font-black uppercase shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-blue-500">
                    <option value="">TODAS LAS SEDES</option>
                    {sedes.map(s => <option key={s.id} value={s.id}>SEDE {s.nombre}</option>)}
                </select>
            </div>

            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1e3a8a] transition-colors" size={20} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="BUSCAR POR NOMBRE, APELLIDO O DNI..."
                    className="w-full bg-white border-2 border-slate-100 rounded-[1.8rem] pl-16 pr-8 py-5 font-black text-xs uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#1e3a8a] transition-all shadow-sm"
                />
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 font-black text-[10px] text-slate-400 uppercase tracking-[0.15em]">
                                <th className="p-8">Alumno / Sede</th>
                                <th className="p-8">Documentación</th>
                                <th className="p-8 text-center">Nivel y Estado</th>
                                <th className="p-8 text-center">Cumpleaños</th>
                                <th className="p-8 text-right">Gestión</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {currentAlumnos.map((alum) => (
                                <tr key={alum.id} className="hover:bg-blue-50/30 transition-all group">
                                    <td className="p-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-[#1e3a8a] text-white rounded-[1.2rem] flex items-center justify-center font-black text-xl italic shadow-lg shadow-blue-100 transition-transform group-hover:scale-110">
                                                {alum.nombres.charAt(0)}
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-sm font-black text-slate-800 uppercase italic tracking-tighter leading-none">{alum.full_name}</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {alum.sedes.length > 0 ? alum.sedes.map((s, idx) => (
                                                        <span key={idx} className="flex items-center gap-1 text-[8px] font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md uppercase border border-orange-100 italic">
                                                            <MapPin size={8} /> {s}
                                                        </span>
                                                    )) : (
                                                        <span className="flex items-center gap-1 text-[8px] font-black text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md uppercase border border-slate-100 italic">
                                                            S/N
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-slate-400 font-black text-[9px] uppercase tracking-widest"><Fingerprint size={14} className="text-slate-300" /> {alum.dni}</div>
                                            <div className="flex items-center gap-2 text-[#1e3a8a] font-bold text-xs italic"><Phone size={14} className="text-blue-300" /> {alum.telefono}</div>
                                        </div>
                                    </td>

                                    <td className="p-8 text-center">
                                        <button
                                            onClick={() => setModalInscripciones({ isOpen: true, data: alum })}
                                            className="inline-flex flex-col gap-2 hover:bg-slate-50 p-3 rounded-2xl transition-all cursor-pointer group border border-transparent hover:border-slate-100 hover:shadow-sm w-full items-center justify-center"
                                            title="Ver detalle de inscripciones"
                                        >
                                            <div className="flex justify-center flex-wrap gap-1">
                                                {alum.niveles.length > 0 ? alum.niveles.map((n, idx) => (
                                                    <span key={idx} className="bg-blue-100 text-[#1e3a8a] text-[8px] font-black px-3 py-1 rounded-lg uppercase italic border border-blue-200 group-hover:scale-105 transition-transform">{n}</span>
                                                )) : (
                                                    <span className="bg-slate-100 text-slate-400 text-[8px] font-black px-3 py-1 rounded-lg uppercase italic border border-slate-200">SIN NIVEL</span>
                                                )}

                                                {alum.multiplesActivas && (
                                                    <span className="bg-orange-500 text-white text-[8px] font-black px-2 py-1 rounded-lg animate-pulse shadow-sm shadow-orange-200">+</span>
                                                )}
                                            </div>
                                            <div className={`flex items-center justify-center gap-1.5 text-[9px] font-black uppercase italic 
                                                ${alum.estadoVisual === 'ACTIVO'
                                                    ? (alum.estaVencido ? 'text-red-500' : 'text-emerald-600')
                                                    : 'text-slate-400'}`}
                                            >
                                                <Zap size={10} fill="currentColor" className={alum.multiplesActivas ? "animate-bounce" : ""} />
                                                {alum.estadoVisual === 'ACTIVO'
                                                    ? (alum.estaVencido ? 'VENCIDO' : 'CORTE')
                                                    : alum.estadoVisual}
                                                : {alum.fechaCorte ? format(subDays(alum.fechaCorte, 1), "dd/MM/yy") : '---'}
                                            </div>
                                        </button>
                                    </td>

                                    <td className="p-8 text-center">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className={`p-2.5 rounded-2xl transition-colors ${alum.cumpleanos !== 'S/D' ? 'bg-pink-50 text-pink-500' : 'bg-slate-50 text-slate-300'}`}>
                                                <Heart size={16} fill={alum.cumpleanos !== 'S/D' ? "currentColor" : "none"} />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-600 uppercase italic tracking-tighter">{alum.cumpleanos}</span>
                                        </div>
                                    </td>
                                    <td className="p-8 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => { setSelectedAlumno(alum); setView('details'); }}
                                                className="w-11 h-11 bg-slate-100 text-slate-500 rounded-xl hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                                                title="Ver Expediente"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedAlumno(alum); setView('cambio_nivel'); }}
                                                disabled={!alum.fechaCorte}
                                                title={!alum.fechaCorte ? "Alumno sin inscripción histórica" : "Cambiar horario"}
                                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase italic shadow-lg transition-all
                                                    ${!alum.fechaCorte
                                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                                        : 'bg-[#1e3a8a] text-white hover:bg-orange-600 shadow-blue-100 active:scale-95'
                                                    }`}
                                            >
                                                <RefreshCw size={14} className={`${alum.fechaCorte ? 'group-hover:rotate-180' : ''} transition-transform duration-500`} />
                                                <span className="hidden md:inline">Horario</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-slate-50/50 border-t border-slate-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Mostrando <span className="text-[#1e3a8a]">{currentAlumnos.length}</span> de <span className="text-slate-600">{filteredAlumnos.length}</span> alumnos
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1e3a8a] hover:text-white transition-all shadow-sm"
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => {
                                if (totalPages > 5 && Math.abs(i + 1 - currentPage) > 1 && i !== 0 && i !== totalPages - 1) {
                                    if (Math.abs(i + 1 - currentPage) === 2) return <span key={i} className="text-slate-300 px-1">...</span>;
                                    return null;
                                }
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${currentPage === i + 1
                                            ? 'bg-[#1e3a8a] text-white shadow-lg shadow-blue-100'
                                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1e3a8a] hover:text-white transition-all shadow-sm"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* 🪟 POPUP DE INSCRIPCIONES DETALLADAS       */}
            {/* ========================================== */}
            {modalInscripciones.isOpen && modalInscripciones.data && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-fade-in-up">
                        <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">
                                    Detalle de <span className="text-[#1e3a8a]">Inscripciones</span>
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                                    {modalInscripciones.data.full_name}
                                </p>
                            </div>
                            <button
                                onClick={() => setModalInscripciones({ isOpen: false, data: null })}
                                className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            {modalInscripciones.data.historialInscripciones.length === 0 ? (
                                <p className="text-center text-sm font-bold text-slate-400 py-8">No hay registros de inscripciones.</p>
                            ) : (
                                modalInscripciones.data.historialInscripciones.map((insc, idx) => (
                                    <div key={idx} className="bg-white border-2 border-slate-50 rounded-2xl p-5 hover:border-blue-100 hover:shadow-md transition-all group relative overflow-hidden">
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${insc.estado === 'ACTIVO' ? (insc.estaVencido ? 'bg-red-500' : 'bg-emerald-500') : 'bg-slate-300'}`}></div>

                                        <div className="flex justify-between items-start pl-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="bg-blue-100 text-[#1e3a8a] text-[9px] font-black px-2 py-1 rounded-md uppercase italic border border-blue-200">
                                                        {insc.nivel}
                                                    </span>
                                                    <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase italic border
                                                        ${insc.estado === 'ACTIVO' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                        {insc.estado}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-black text-slate-700 uppercase italic mt-2">
                                                    SEDE {insc.sede}
                                                </p>

                                                {/* 🔥 AQUÍ PINTAMOS EL HORARIO Y DÍA */}
                                                {insc.horario && (
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase mt-1">
                                                        <Clock size={12} className="text-blue-400" />
                                                        {insc.horario}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Fecha de Corte</p>
                                                <div className={`text-base font-black uppercase italic flex items-center justify-end gap-1
                                                    ${insc.estado === 'ACTIVO'
                                                        ? (insc.estaVencido ? 'text-red-500' : 'text-slate-800')
                                                        : 'text-slate-400'}`}
                                                >
                                                    <Calendar size={14} />
                                                    {insc.fechaCorte ? format(insc.fechaCorte, "dd MMM yyyy", { locale: es }) : '---'}
                                                </div>
                                                {insc.estado === 'ACTIVO' && insc.estaVencido && (
                                                    <p className="text-[8px] font-bold text-red-500 uppercase mt-1 animate-pulse">PAGO PENDIENTE</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
//sadasdasdasdasdasdasd

export default AdminStudentsManager;