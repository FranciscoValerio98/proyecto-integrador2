import React, { useState, useEffect } from 'react';
import { 
    Plus, Search, Phone, Loader2, UserCog, ArrowLeft, 
    Mail, Award, Calendar, Fingerprint, User, 
    ShieldCheck, Info, Save, Edit3 
} from 'lucide-react';
import AdminTeachers from './AdminTeachers';
import AdminTeacherEdit from './AdminTeacherEdit'; // 🔥 Importamos el nuevo componente
import { apiFetch } from '../../interceptors/api';
import toast from 'react-hot-toast';
import { API_ROUTES } from '../../constants/apiRoutes';

const AdminTeachersManager = () => {
    const [view, setView] = useState('list');
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [coordinadores, setCoordinadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCoordinadores = async () => {
        try {
            setLoading(true);
            const response = await apiFetch.get(API_ROUTES.USUARIOS.COORDINADORES);
            const result = await response.json();

            if (response.ok) {
                const formattedData = result.data.map(user => ({
                    id: user.id,
                    nombres: user.nombres,
                    apellidos: user.apellidos,
                    email: user.email,
                    rol_id: "Coordinador",
                    telefono_personal: user.telefono_personal || 'No registrado',
                    tipo_documento_id: user.tipo_documento_id,
                    numero_documento: user.numero_documento,
                    fecha_nacimiento: user.fecha_nacimiento ? new Date(user.fecha_nacimiento).toLocaleDateString('es-PE') : '---',
                    genero: user.genero,
                    datosRolEspecifico: {
                        especializacion: user.coordinadores?.especializacion || 'Coordinador General'
                    }
                }));
                setCoordinadores(formattedData);
            }
        } catch (error) {
            toast.error("Error al cargar la lista de coordinadores");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (view === 'list') fetchCoordinadores();
    }, [view]);

    const filteredTeachers = coordinadores.filter(t => {
        const fullSearch = `${t.nombres} ${t.apellidos} ${t.datosRolEspecifico.especializacion}`.toLowerCase();
        return fullSearch.includes(searchTerm.toLowerCase());
    });

    const handleViewDetails = (teacher) => {
        setSelectedTeacher(teacher);
        setView('details');
    };

    // --- RENDERIZADO CONDICIONAL DE VISTAS ---

    if (view === 'create') {
        return <AdminTeachers onBack={() => setView('list')} />;
    }

    if (view === 'edit' && selectedTeacher) {
        return (
            <AdminTeacherEdit 
                teacherData={selectedTeacher} 
                onBack={() => setView('details')} 
                onSuccess={() => {
                    setView('list');
                    fetchCoordinadores();
                }} 
            />
        );
    }

    if (view === 'details' && selectedTeacher) {
        return (
            <div className="space-y-6 animate-fade-in-up p-1">
                <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('list')} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm text-slate-600 transition-all">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">
                                Expediente <span className="text-[#1e3a8a]">Profesional</span>
                            </h1>
                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] ml-1">Staff Técnico Gema</p>
                        </div>
                    </div>

                    {/* 🔥 BOTÓN PARA ACTIVAR EDICIÓN */}
                    <button 
                        onClick={() => setView('edit')}
                        className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#0f172a] transition-all shadow-lg"
                    >
                        <Edit3 size={16} /> Editar Perfil
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-[#0f172a] rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><Award size={100} /></div>
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-3xl flex items-center justify-center text-3xl font-black italic shadow-lg mb-4 transform -rotate-3">
                                    {selectedTeacher.nombres[0]}
                                </div>
                                <h2 className="text-xl font-black uppercase italic tracking-tighter">{selectedTeacher.nombres} {selectedTeacher.apellidos}</h2>
                                <span className="bg-white/10 text-orange-400 text-[10px] font-black px-4 py-1 rounded-full uppercase mt-3 border border-white/5">
                                    {selectedTeacher.rol_id}
                                </span>
                            </div>
                        </div>
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Especialidad Principal</h4>
                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                                <Award className="text-blue-600" size={20} />
                                <p className="text-xs font-black text-[#1e3a8a] uppercase italic">{selectedTeacher.datosRolEspecifico.especializacion}</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                                <UserCog className="text-[#1e3a8a]" size={18} />
                                <span className="text-xs font-black text-slate-800 uppercase italic">Información Detallada del Usuario</span>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <Fingerprint size={14} /><p className="text-[9px] font-black uppercase">Identificación</p>
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">
                                        <span className="text-blue-600 mr-2">{selectedTeacher.tipo_documento_id}</span>
                                        {selectedTeacher.numero_documento}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <Mail size={14} /><p className="text-[9px] font-black uppercase">Email</p>
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 lowercase">{selectedTeacher.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <Phone size={14} /><p className="text-[9px] font-black uppercase">Teléfono</p>
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">{selectedTeacher.telefono_personal}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <Calendar size={14} /><p className="text-[9px] font-black uppercase">Nacimiento</p>
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">{selectedTeacher.fecha_nacimiento}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center gap-3">
                            <Info size={16} className="text-blue-500" />
                            <p className="text-[9px] font-bold text-slate-500 leading-tight uppercase italic">Los datos de acceso y contraseñas son confidenciales por motivos de seguridad.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up p-1">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 mb-1">
                    <div className="h-6 w-1 bg-orange-500 rounded-full"></div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">
                        Panel <span className="text-[#1e3a8a]">Coordinador</span>
                    </h1>
                </div>
                <button onClick={() => setView('create')} className="bg-[#1e3a8a] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all hover:bg-orange-500 shadow-lg">
                    <Plus size={20} /> Registrar Coordinador
                </button>
            </div>

            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="BUSCAR STAFF POR NOMBRE O ESPECIALIDAD..."
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-12 py-3 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                />
            </div>

            {loading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-500" size={40} /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeachers.map((teacher) => (
                        <div key={teacher.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                            <div className="absolute -right-4 -top-4 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity"><UserCog size={80} /></div>
                            <div className="flex items-start gap-4 mb-6 relative z-10">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-[#1e3a8a] font-black text-2xl group-hover:bg-[#1e3a8a] group-hover:text-white transition-all">
                                    {teacher.nombres[0]}
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 uppercase italic leading-tight">{teacher.nombres} {teacher.apellidos}</h3>
                                    <p className="text-orange-500 text-[9px] font-black uppercase mt-1 tracking-widest">{teacher.datosRolEspecifico?.especializacion}</p>
                                </div>
                            </div>
                            <button onClick={() => handleViewDetails(teacher)} className="w-full py-3 rounded-xl border border-slate-100 text-slate-400 text-[10px] font-black uppercase hover:bg-slate-50 transition-all shadow-sm">
                                Ver Perfil Técnico
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminTeachersManager;