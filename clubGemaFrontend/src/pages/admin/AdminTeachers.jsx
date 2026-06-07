import React, { useState } from 'react';
import { Save, User, Mail, GraduationCap, Phone, ArrowLeft, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { apiFetch } from '../../interceptors/api'; // Importa tu interceptor
import toast from 'react-hot-toast';
import { API_ROUTES } from '../../constants/apiRoutes';

const AdminTeachers = ({ onBack }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        email: '',
        telefono_personal: '',
        tipo_documento_id: 'DNI',
        numero_documento: '',
        especializacion: '',
        genero: '',
        fecha_nacimiento: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        // Validaciones básicas
        if (!formData.email || !formData.numero_documento || !formData.nombres) {
            toast.error("Por favor, completa los campos obligatorios.");
            return;
        }

        setLoading(true);

        // Construcción del objeto EXACTO que pediste
        const payload = {
            email: formData.email,
            password: formData.numero_documento, // Password por defecto
            nombres: formData.nombres,
            apellidos: formData.apellidos,
            rol_id: "coordinador",
            tipo_documento_id: formData.tipo_documento_id,
            numero_documento: formData.numero_documento,
            telefono_personal: formData.telefono_personal,
            fecha_nacimiento: formData.fecha_nacimiento, // Formato YYYY-MM-DD
            genero: formData.genero === "Masculino" ? "M" : "F",
            datosRolEspecifico: {
                especializacion: formData.especializacion
            }
        };

        try {
            const response = await apiFetch.post(API_ROUTES.USUARIOS.REGISTER, payload);

            if (response.ok) {
                toast.success("¡Coordinador registrado exitosamente!");
                onBack(); // Regresa al listado
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || "Error al registrar");
            }
        } catch (error) {
            console.error("Error en registro:", error);
            toast.error("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up p-1">
            {/* Header Formulario */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="group flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-xl hover:border-orange-500 hover:text-orange-500 transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-0.5">
                            <div className="h-5 w-1 bg-orange-500 rounded-full"></div>
                            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                Registro de <span className="text-[#1e3a8a]">Coordinador</span>
                            </h1>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Creación de cuenta federada</p>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-[#0f172a] hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {loading ? 'Procesando...' : 'Finalizar Registro'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Sección 1: Datos Personales */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                            <User size={18} className="text-[#1e3a8a]" />
                            <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">Perfil e Identidad</h3>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombres</label>
                                <input name="nombres" placeholder="Ej: María" onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Apellidos</label>
                                <input name="apellidos" placeholder="Ej: González" onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tipo de Doc.</label>
                                <select name="tipo_documento_id" onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none">
                                    <option value="DNI">DNI</option>
                                    <option value="CE">C.E.</option>
                                    <option value="PAS">Pasaporte</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nro. Documento (Será la clave)</label>
                                <input name="numero_documento" placeholder="45678901" onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 shadow-inner" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">F. Nacimiento</label>
                                <input name="fecha_nacimiento" type='date' onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Género</label>
                                <select name="genero" onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none">
                                    <option value="">Seleccionar...</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Femenino">Femenino</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Sección 2: Contacto */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                            <Mail size={18} className="text-[#1e3a8a]" />
                            <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">Comunicación</h3>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Email</label>
                                <input name="email" type="email" placeholder="coordinador.nuevo@gmail.com" onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Teléfono Personal</label>
                                <input name="telefono_personal" placeholder="+51 912345678" onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Lateral */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                            <GraduationCap size={18} className="text-orange-500" />
                            <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">Especialidad</h3>
                        </div>
                        <div className="p-6">
                            <textarea
                                name="especializacion"
                                onChange={handleChange}
                                placeholder="Describa el área técnica (Ej: Nivel Básico)..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold outline-none h-40 resize-none focus:ring-2 focus:ring-orange-500/20"
                            />
                        </div>
                    </div>

                    <div className="bg-[#0f172a] p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <Lock size={28} className="text-orange-500 mb-4" />
                            <h4 className="font-black uppercase italic tracking-tighter text-lg leading-tight">Clave Temporal</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-3 leading-relaxed">
                                Una vez registrado, el coordinador podrá ingresar usando su número de documento como contraseña inicial. <br></br><br></br> <span className='text-white'>¡Importante! <br></br> Recibirá sus credenciales de acceso en el EMAIL registrado.</span>
                            </p>
                        </div>
                        <ShieldCheck size={100} className="absolute -right-6 -bottom-6 opacity-5 rotate-12" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTeachers;