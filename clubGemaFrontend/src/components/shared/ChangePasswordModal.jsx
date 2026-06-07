import React, { useState } from 'react';
import { X, Save, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import apiFetch from '../../interceptors/api.js';
import toast from 'react-hot-toast';
import { API_ROUTES } from '../../constants/apiRoutes.js';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Las contraseñas nuevas no coinciden");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch.post(API_ROUTES.AUTH.CHANGE_PASSWORD, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Error al cambiar la contraseña");
      
      toast.success("¡Contraseña actualizada con éxito!");
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0f172a]/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* HEADER COMPACTO */}
        <div className="bg-[#1e3a8a] p-5 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 rounded-xl">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="font-black uppercase italic text-lg leading-none">Seguridad</h3>
              <p className="text-[9px] font-bold opacity-70 uppercase tracking-wider mt-0.5">Cambio de Contraseña</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white">
            <X size={20} />
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="p-6">
          <form id="password-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Contraseña Actual</label>
              <div className="relative">
                <input 
                  type={showCurrent ? "text" : "password"} 
                  required
                  value={formData.currentPassword} 
                  onChange={e => setFormData({ ...formData, currentPassword: e.target.value })} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm font-bold outline-none focus:border-orange-500 transition-colors" 
                  placeholder="Ingresa tu contraseña actual"
                />
                <button 
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors p-1"
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nueva Contraseña</label>
              <div className="relative">
                <input 
                  type={showNew ? "text" : "password"} 
                  required
                  value={formData.newPassword} 
                  onChange={e => setFormData({ ...formData, newPassword: e.target.value })} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm font-bold outline-none focus:border-orange-500 transition-colors" 
                  placeholder="Min. 6 caracteres"
                />
                <button 
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors p-1"
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Confirmar Nueva Contraseña</label>
              <div className="relative">
                <input 
                  type={showConfirm ? "text" : "password"} 
                  required
                  value={formData.confirmPassword} 
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm font-bold outline-none focus:border-orange-500 transition-colors" 
                  placeholder="Repite la nueva contraseña"
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors p-1"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* FOOTER FIJO CON BOTÓN */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
          <button form="password-form" type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 uppercase tracking-widest text-xs">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {loading ? "ACTUALIZANDO..." : "ACTUALIZAR CONTRASEÑA"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ChangePasswordModal;
