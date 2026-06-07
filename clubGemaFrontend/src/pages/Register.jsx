import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, CreditCard, Mail, Lock, EyeOff, Eye, ChevronDown,
    Hash, ArrowLeft, ShieldCheck, CheckCircle2, Heart
} from 'lucide-react';
import { registerService } from '../services/auth.service';
import toast from 'react-hot-toast';

const TERMINOS_Y_CONDICIONES = [
    { title: "Uso de Imagen", desc: "Autorizo el uso de mi imagen y voz para materiales promocionales del Club Gema en medios digitales." },
    { title: "Salud y Riesgo", desc: "Declaro conocer mis condiciones físicas y de salud y deslindo al Club de cualquier complicación médica, lesión o accidente derivado de mi propia condición o negligencia." },
    { title: "Bienes Personales", desc: "El Club no se responsabiliza por pérdida, hurto o deterioro de objetos personales dentro de las sedes." },
    { title: "Uso de equipos e infraestructura", desc: "Me comprometo al uso correcto de los equipos e infraestructura, asumiendo cualquier daño ocasionado por uso indebido. " },
    { title: "Programación", desc: "Acepto la suspensión de clases en feriados nacionales sin recuperación y que por motivos externos como clima, manifestaciones sociales, entre otros, las clases serán recuperadas." },
    { title: "Adicionales", desc: "Me comprometo a realizar los pagos en la fecha correspondiente al vencimiento de cada mes. Entiendo que mis datos personales serán utilizados únicamente para fines administrativos, y que debo mantener respeto y buena convivencia con los entrenadores y compañeros." }
];

const TerminoItem = React.memo(({ item, idx }) => (
    <div className="flex gap-5 items-start">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[11px] font-black shadow-sm">
            {idx + 1}
        </div>
        <div className="space-y-1">
            <h5 className="text-[12px] font-black uppercase tracking-widest text-[#1e3a8a]">{item.title}</h5>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
        </div>
    </div>
));

function Register() {
    const navigate = useNavigate();
    const [aceptarTerminos, setAceptarTerminos] = useState(false);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [lecturaCompletada, setLecturaCompletada] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rolIdAlumno, setRolIdAlumno] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [tiposDocumento, setTiposDocumento] = useState([]);

    const [formData, setFormData] = useState({
        nombres: '', apellidos: '', email: '', tipo_documento_id: '',
        numero_documento: '', password: '', telefono_personal: '',
        fecha_nacimiento: '', genero: '', contacto_emergencia: '', parentesco: ''
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [resDocs, resRol] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/tipos-documento`),
                    fetch(`${import.meta.env.VITE_API_URL}/roles/nombre/Alumno`)
                ]);
                const dataDocs = await resDocs.json();
                if (resDocs.ok && dataDocs.data) {
                    setTiposDocumento(dataDocs.data);
                    if (dataDocs.data.length > 0) {
                        setFormData(prev => ({ ...prev, tipo_documento_id: dataDocs.data[0].id }));
                    }
                }
                const dataRol = await resRol.json();
                if (resRol.ok && dataRol.data) setRolIdAlumno(dataRol.data.id);
            } catch (error) {
                console.error("Error al cargar datos iniciales:", error);
            }
        };
        fetchInitialData();
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        if (name === "telefono_personal" || name === "contacto_emergencia") {
            const onlyNums = value.replace(/\D/g, "").slice(0, 9);
            setFormData((prev) => ({ ...prev, [name]: onlyNums }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    }, []);

    const cerrarModal = () => {
        setModalAbierto(false);
        setLecturaCompletada(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rolIdAlumno) return toast.error("Error del sistema: Perfil de Alumno no disponible.");
        if (!aceptarTerminos) return toast.error("Debes aceptar los términos y condiciones.");
        const toastId = toast.loading('Procesando inscripción...');
        setLoading(true);
        try {

            // Separamos los datos básicos de los específicos del rol
            const { contacto_emergencia, parentesco, ...datosBasicos } = formData;

            const payloadFinal = {
                ...datosBasicos,
                rol_id: rolIdAlumno,
                datosRolEspecifico: {
                    contacto_emergencia,
                    parentesco
                }
            };

            const response = await registerService(payloadFinal);
            const generatedUsername = response.data?.username;
            const displayUsername = generatedUsername || "Usuario";
            toast.success(
                (t) => (<span>¡Bienvenido! Tu usuario es: <b>{displayUsername}</b></span>),
                { id: toastId, duration: 10000 }
            );
            navigate('/login', {
                state: { prefillUsername: generatedUsername || '' }
            });
        } catch (error) {
            toast.error(error.message || "Error al crear la cuenta", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-2 md:p-4 font-sans relative overflow-x-hidden bg-[#0f172a]">
            {/* FONDO */}
            <div className="absolute inset-0 z-0">
                <img src="/bg.jpg" alt="Background" className="w-full h-full object-cover opacity-40" />
                <div className="absolute inset-0 backdrop-blur-[6px] bg-[#0f172a]/60"></div>
            </div>

            {/* BOTÓN VOLVER - Ajustado para no estorbar en móvil */}
            <button
                onClick={() => navigate('/login')}
                className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 md:gap-3 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-xl hover:bg-white/10 z-50 text-[10px] md:text-xs font-black uppercase tracking-widest shadow-2xl"
            >
                <ArrowLeft size={16} className="text-orange-500" /> Volver
            </button>

            {/* TARJETA PRINCIPAL */}
            <div className="max-w-6xl w-full bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/10 z-10 animate-fade-in my-8 md:my-0">

                {/* LADO IZQUIERDO: Branding (Arriba en móvil, lateral en MD) */}
                <div className="w-full md:w-1/3 bg-gradient-to-b from-blue-600 via-blue-800 to-indigo-950 p-6 md:p-10 text-white flex flex-col justify-center items-center relative overflow-hidden shrink-0">
                    <div className="z-10 text-center">
                        <img src="/logo_diamante.jpeg" alt="Logo" className="rounded-full w-24 h-24 md:w-40 md:h-40 mx-auto mb-4 md:mb-6 shadow-2xl border-4 border-white/10" />
                        <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter leading-none">Club Gema</h2>
                        <div className="h-1 w-8 md:w-12 bg-orange-500 mx-auto my-3 md:my-4 rounded-full"></div>
                        <p className="text-blue-100 text-[10px] md:text-sm font-medium opacity-80">Portal Oficial Club Gema</p>
                    </div>
                </div>

                {/* LADO DERECHO: Formulario (Scroll interno solo en desktop, natural en móvil) */}
                <div className="w-full md:w-2/3 p-6 md:p-14 bg-white md:max-h-[90vh] md:overflow-y-auto custom-scrollbar">
                    <div className="mb-8 text-left border-b border-slate-100 pb-4">
                        <h3 className="text-2xl md:text-3xl font-black text-[#1e3a8a] uppercase italic tracking-tighter leading-none">
                            Inscripción Alumno
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                            <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                                Datos del Participante
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                        {/* Grupo 1: Email y Pass */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                            <div className="space-y-1.5 md:space-y-2 text-left">
                                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico *</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                                    <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="ejemplo@gmail.com"
                                        className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-orange-500 outline-none transition-all text-sm font-semibold shadow-sm" />
                                </div>
                            </div>
                            <div className="space-y-1.5 md:space-y-2 text-left">
                                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña *</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                                    <input type={showPassword ? "text" : "password"} name="password" required value={formData.password} onChange={handleChange} placeholder="********"
                                        className="w-full pl-10 md:pl-12 pr-12 py-3 md:py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-orange-500 outline-none transition-all text-sm font-semibold shadow-sm" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Grupo 2: Nombres y Género */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                            <div className="space-y-1.5 md:space-y-2 text-left">
                                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombres *</label>
                                <input type="text" name="nombres" required value={formData.nombres} onChange={handleChange} placeholder="Juan Alberto"
                                    className="w-full px-4 py-3 md:py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-orange-500 outline-none transition-all text-sm font-semibold shadow-sm" />
                            </div>
                            <div className="space-y-1.5 md:space-y-2 text-left">
                                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Apellidos *</label>
                                <input type="text" name="apellidos" required value={formData.apellidos} onChange={handleChange} placeholder="Pérez García"
                                    className="w-full px-4 py-3 md:py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-orange-500 outline-none transition-all text-sm font-semibold shadow-sm" />
                            </div>
                            <div className="space-y-1.5 md:space-y-2 text-left sm:col-span-2 md:col-span-1">
                                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Género *</label>
                                <select name="genero" required value={formData.genero} onChange={handleChange} className="w-full px-4 py-3 md:py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm">
                                    <option value="">Elegir...</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                    <option value="O">Otro</option>
                                </select>
                            </div>
                        </div>

                        {/* Grupo 3: Documentación */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                            <div className="space-y-1.5 md:space-y-2 text-left">
                                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo Doc. *</label>
                                <div className="relative">
                                    <select name="tipo_documento_id" required value={formData.tipo_documento_id} onChange={handleChange} className="w-full px-4 py-3 md:py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none appearance-none font-bold text-sm">
                                        {tiposDocumento.map((doc) => <option key={doc.id} value={doc.id}>{doc.id}</option>)}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-1.5 md:space-y-2 text-left">
                                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número Doc *</label>
                                <input type="text" name="numero_documento" required value={formData.numero_documento} onChange={handleChange} placeholder="70001000"
                                    className="w-full px-4 py-3 md:py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-orange-500 outline-none text-sm font-semibold shadow-sm" />
                            </div>
                            <div className="space-y-1.5 md:space-y-2 text-left sm:col-span-2 md:col-span-1">
                                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha Nac. *</label>
                                <input type="date" name="fecha_nacimiento" required value={formData.fecha_nacimiento} onChange={handleChange} className="w-full px-4 py-3 md:py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm" />
                            </div>
                        </div>

                        {/* Grupo 4: Contacto */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                            <div className="space-y-1.5 md:space-y-2 text-left">
                                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mi Celular *</label>
                                <input type="tel" name="telefono_personal" required value={formData.telefono_personal} onChange={handleChange} placeholder="999888777"
                                    className="w-full px-4 py-3 md:py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-orange-500 outline-none text-sm font-semibold shadow-sm" />
                            </div>
                            <div className="space-y-1.5 md:space-y-2 text-left">
                                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Emergencia *</label>
                                <input type="tel" name="contacto_emergencia" required value={formData.contacto_emergencia} onChange={handleChange} placeholder="944555666"
                                    className="w-full px-4 py-3 md:py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-orange-500 outline-none text-sm font-semibold shadow-sm" />
                            </div>
                            <div className="space-y-1.5 md:space-y-2 text-left sm:col-span-2 md:col-span-1">
                                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parentesco *</label>
                                <select name="parentesco" required value={formData.parentesco} onChange={handleChange} className="w-full px-4 py-3 md:py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm">
                                    <option value="">Elegir...</option>
                                    <option value="familiar">Familiar</option>
                                    <option value="pareja">Pareja</option>
                                    <option value="amistad">Amistad</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>
                        </div>

                        {/* TÉRMINOS Y CONDICIONES - Ajuste de padding en móvil */}
                        <div className="pt-2">
                            <div className={`p-4 md:p-5 rounded-[1.5rem] md:rounded-[2.5rem] border-2 transition-all flex items-center gap-3 md:gap-5 ${lecturaCompletada ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-100'}`}>
                                <ShieldCheck className={lecturaCompletada ? 'text-orange-500' : 'text-slate-300'} size={20} md:size={24} />
                                <div className="flex-1 text-left">
                                    <button type="button" onClick={() => setModalAbierto(true)} className="text-[10px] md:text-xs font-black uppercase text-[#1e3a8a] hover:text-orange-600 transition-colors text-left">Ver Términos y Condiciones</button>
                                    <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase mt-0.5 md:mt-1 italic tracking-tight">Debes leer para habilitar</p>
                                </div>
                                <input type="checkbox" checked={aceptarTerminos} onChange={(e) => setAceptarTerminos(e.target.checked)} disabled={!lecturaCompletada} className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl text-orange-500 cursor-pointer" />
                            </div>
                        </div>

                        <button type="submit" disabled={!aceptarTerminos || loading} className="w-full bg-[#1e3a8a] hover:bg-orange-500 text-white font-black py-4 md:py-5 rounded-xl md:rounded-2xl uppercase tracking-[0.2em] text-[10px] md:text-xs transition-all shadow-xl active:scale-95 disabled:opacity-30">
                            {loading ? "Procesando..." : "Finalizar Inscripción"}
                        </button>
                    </form>
                </div>
            </div>

            {/* MODAL OPTIMIZADO PARA MÓVIL */}
            {modalAbierto && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 bg-[#020617]/90 backdrop-blur-md animate-fade-in">
                    <div className="bg-white w-full max-w-xl rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/10">
                        <div className="relative p-6 md:p-10 bg-[#1e3a8a] text-white shrink-0">
                            <div className="relative z-10 text-left">
                                <p className="text-orange-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1 md:mb-2">Club Gema</p>
                                <h4 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter leading-tight md:leading-none">Compromiso de<br />Participación</h4>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                            <div className="p-6 md:p-10 space-y-6 md:space-y-8 text-left">
                                {TERMINOS_Y_CONDICIONES.map((item, idx) => (
                                    <TerminoItem key={idx} item={item} idx={idx} />
                                ))}
                            </div>
                        </div>
                        <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 shrink-0">
                            <button onClick={cerrarModal} className="w-full bg-orange-500 text-white font-black py-4 md:py-5 rounded-xl md:rounded-2xl uppercase text-[10px] md:text-xs shadow-xl shadow-orange-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3">
                                <CheckCircle2 size={16} md:size={18} /> Aceptar y Continuar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Register;

