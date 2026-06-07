import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Phone, HeartPulse, MapPin, User, ArrowLeft } from 'lucide-react';
import apiFetch from '../../../interceptors/api.js';
import toast from 'react-hot-toast';
import { API_ROUTES } from '../../../constants/apiRoutes.js';

const DISTRITOS_LIMA = [
  "Ancón", "Ate", "Barranco", "Breña", "Carabayllo", "Chaclacayo", "Chorrillos", "Cieneguilla",
  "Comas", "El Agustino", "Independencia", "Jesús María", "La Molina", "La Victoria", "Lima (Cercado)",
  "Lince", "Los Olivos", "Lurigancho-Chosica", "Lurín", "Magdalena del Mar", "Miraflores",
  "Pachacámac", "Pucusana", "Pueblo Libre", "Puente Piedra", "Punta Hermosa", "Punta Negra",
  "Rímac", "San Bartolo", "San Borja", "San Isidro", "San Juan de Lurigancho", "San Juan de Miraflores",
  "San Luis", "San Martín de Porres", "San Miguel", "Santa Anita", "Santa María del Mar",
  "Santa Rosa", "Santiago de Surco", "Surquillo", "Villa El Salvador", "Villa María del Triunfo"
];

const EditProfileModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '', telefono_personal: '', tipo_documento_id: '', numero_documento: '',
    fecha_nacimiento: '', genero: '', condiciones_medicas: '', seguro_medico: '',
    grupo_sanguineo: '', direccion_completa: '', distrito: '', ciudad: 'Lima', referencia: ''
  });

  useEffect(() => {
    const cargarDatos = async () => {
      if (isOpen) {
        setLoading(true);
        try {
          const response = await apiFetch.get(API_ROUTES.ALUMNOS.MI_PERFIL);
          const result = await response.json();
          if (response.ok && result.data) {
            const user = result.data;
            const alumno = user.alumnos || {};
            const dir = alumno.direcciones || {};
            setFormData({
              email: user.email || '', telefono_personal: user.telefono_personal || '',
              tipo_documento_id: user.tipo_documento_id || '', numero_documento: user.numero_documento || '',
              fecha_nacimiento: user.fecha_nacimiento ? user.fecha_nacimiento.split('T')[0] : '',
              genero: user.genero || '', condiciones_medicas: alumno.condiciones_medicas || '',
              seguro_medico: alumno.seguro_medico || '', grupo_sanguineo: alumno.grupo_sanguineo || '',
              direccion_completa: dir.direccion_completa || '', distrito: dir.distrito || '',
              ciudad: dir.ciudad || 'Lima', referencia: dir.referencia || ''
            });
          }
        } catch (error) {
          toast.error("Error al cargar perfil");
        } finally {
          setLoading(false);
        }
      }
    };
    cargarDatos();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value && value.toString().trim() !== '') acc[key] = value;
        return acc;
      }, {});

      const response = await apiFetch.patch(API_ROUTES.ALUMNOS.MI_PERFIL, payload);
      const result = await response.json();

      if (!response.ok) throw new Error(result.errors ? result.errors[0].message : result.message);
      
      toast.success("¡Perfil actualizado!");
      if (onSuccess) onSuccess(result.data);
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4 bg-[#0f172a]/90 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* HEADER COMPACTO */}
        <div className="bg-[#1e3a8a] p-4 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h3 className="font-black uppercase italic text-lg leading-none">Mi <span className="text-orange-500">Expediente</span></h3>
              <p className="text-[9px] font-bold opacity-70 uppercase tracking-wider mt-0.5">Sincronización en vivo</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        {/* CONTENIDO SCROLLEABLE */}
        <div className="overflow-y-auto p-5 custom-scrollbar">
          <form id="profile-form" onSubmit={handleSubmit} className="space-y-5">
            
            {/* SECCIÓN 1: PERSONALES */}
            <div className="space-y-3">
              <div className="border-b border-slate-100 pb-1.5 flex items-center gap-2">
                <User size={14} className="text-[#1e3a8a]" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personales</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Teléfono" value={formData.telefono_personal} onChange={e => setFormData({ ...formData, telefono_personal: e.target.value })} className="col-span-2 sm:col-span-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-orange-500" />
                <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="col-span-2 sm:col-span-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-orange-500" />
                <select value={formData.tipo_documento_id} onChange={e => setFormData({ ...formData, tipo_documento_id: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-orange-500">
                  <option value="">Documento</option>{['DNI', 'PAS', 'CE'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <input type="text" placeholder="N° Documento" value={formData.numero_documento} onChange={e => setFormData({ ...formData, numero_documento: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-orange-500" />
                <select value={formData.genero} onChange={e => setFormData({ ...formData, genero: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-orange-500">
                  <option value="">Género</option><option value="M">Masculino (M)</option><option value="F">Femenino (F)</option>
                </select>
                <div className="relative">
                  <label className="text-[8px] font-black text-slate-400 uppercase absolute -top-1.5 left-2 bg-white px-1">Nacimiento</label>
                  <input type="date" value={formData.fecha_nacimiento} onChange={e => setFormData({ ...formData, fecha_nacimiento: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-orange-500" />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: SALUD */}
            <div className="space-y-3">
              <div className="border-b border-slate-100 pb-1.5 flex items-center gap-2">
                <HeartPulse size={14} className="text-orange-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salud</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Alergias o condiciones" value={formData.condiciones_medicas} onChange={e => setFormData({ ...formData, condiciones_medicas: e.target.value })} className="col-span-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-orange-500" />
                <input type="text" placeholder="Seguro (EPS/SIS)" value={formData.seguro_medico} onChange={e => setFormData({ ...formData, seguro_medico: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-orange-500" />
                <select value={formData.grupo_sanguineo} onChange={e => setFormData({ ...formData, grupo_sanguineo: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-orange-500">
                  <option value="">Sangre</option>{['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {/* SECCIÓN 3: UBICACIÓN */}
            <div className="space-y-3">
              <div className="border-b border-slate-100 pb-1.5 flex items-center gap-2">
                <MapPin size={14} className="text-blue-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ubicación</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Dirección completa" value={formData.direccion_completa} onChange={e => setFormData({ ...formData, direccion_completa: e.target.value })} className="col-span-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-orange-500" />
                <select value={formData.distrito} onChange={e => setFormData({ ...formData, distrito: e.target.value })} className="col-span-2 sm:col-span-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-orange-500">
                  <option value="">Distrito</option>{DISTRITOS_LIMA.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input type="text" placeholder="Referencia" value={formData.referencia} onChange={e => setFormData({ ...formData, referencia: e.target.value })} className="col-span-2 sm:col-span-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-orange-500" />
              </div>
            </div>
          </form>
        </div>

        {/* FOOTER FIJO CON BOTÓN */}
        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
          <button form="profile-form" type="submit" disabled={loading} className="w-full bg-[#1e3a8a] hover:bg-[#0f172a] text-white font-black py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {loading ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditProfileModal;