import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Loader2, Phone, User, ArrowLeft } from 'lucide-react';
import apiFetch from '../../interceptors/api.js';
import toast from 'react-hot-toast';
import { API_ROUTES } from '../../constants/apiRoutes.js';

const EditTeacherProfileModal = ({ isOpen, onClose, onSuccess, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono_personal: '',
    especializacion: ''
  });

  useEffect(() => {
    if (isOpen && currentUser) {
      setFormData({
        nombres: currentUser.nombres || '',
        apellidos: currentUser.apellidos || '',
        email: currentUser.email || '',
        telefono_personal: currentUser.telefono_personal || '',
        especializacion: currentUser.coordinadores?.especializacion || ''
      });
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value && value.toString().trim() !== '') acc[key] = value;
        return acc;
      }, {});

      const response = await apiFetch.patch(API_ROUTES.COORDINADORES.BY_ID(currentUser.id), payload);
      const result = await response.json();

      if (!response.ok) throw new Error(result.errors ? result.errors[0].message : result.message);

      toast.success("¡Datos actualizados!");
      if (onSuccess) onSuccess(result.data);
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-[#0f172a]/90 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">

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
          <form id="profile-teacher-form" onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-3">
              <div className="border-b border-slate-100 pb-1.5 flex items-center gap-2">
                <User size={14} className="text-[#1e3a8a]" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Datos Generales</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Nombres</label>
                  <input type="text" placeholder="Tus nombres" value={formData.nombres} onChange={e => setFormData({ ...formData, nombres: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Apellidos</label>
                  <input type="text" placeholder="Tus apellidos" value={formData.apellidos} onChange={e => setFormData({ ...formData, apellidos: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Email Asociado</label>
                  <input type="email" placeholder="Ingresa tu correo" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Celular / WhatsApp</label>
                  <input type="text" placeholder="Número de contacto" value={formData.telefono_personal} onChange={e => setFormData({ ...formData, telefono_personal: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-orange-500" />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="border-b border-slate-100 pb-1.5 flex items-center gap-2">
                <ArrowLeft size={14} className="text-[#1e3a8a] rotate-180" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Datos Profesionales</span>
              </div>
              <div className="grid grid-cols-1 gap-4 mt-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Especialización</label>
                  <input type="text" placeholder="Ej. Baloncesto Técnico" value={formData.especializacion} onChange={e => setFormData({ ...formData, especializacion: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-orange-500" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-2">
              <button type="submit" disabled={loading} className="w-full bg-[#1e3a8a] hover:bg-[#0f172a] text-white font-black py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md uppercase tracking-wider text-xs">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {loading ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default EditTeacherProfileModal;
