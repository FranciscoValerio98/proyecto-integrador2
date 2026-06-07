import React, { useState } from 'react';
import { Save, Trophy, ArrowLeft, Loader2 } from 'lucide-react';
import { apiFetch } from '../../interceptors/api';
import toast from 'react-hot-toast';
import { API_ROUTES } from '../../constants/apiRoutes';

const AdminLevels = ({ onBack, initialData }) => {
    const [loading, setLoading] = useState(false);
    const isEdit = !!initialData;

    const [formData, setFormData] = useState({
        nombre: initialData?.nombre || '',
        // Mantenemos el precio en el estado interno pero no lo mostramos en el UI
        precio_referencial: initialData?.precio_referencial || 0
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombre.trim()) return toast.error("El nombre es obligatorio");

        setLoading(true);
        const payload = {
            nombre: formData.nombre.trim().toUpperCase(),
            // Se envía el precio que ya tenía o 0 por defecto para evitar errores en el Backend
            precio_referencial: parseFloat(formData.precio_referencial) || 0
        };

        try {
            const url = isEdit ? API_ROUTES.NIVELES.BY_ID(initialData.id) : API_ROUTES.NIVELES.BASE;
            const response = await apiFetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (response.ok) {
                toast.success(isEdit ? "¡Nivel actualizado!" : "¡Nivel creado exitosamente!");
                onBack();
            } else {
                toast.error(result.message || "Error en la operación");
            }
        } catch (error) {
            toast.error("Error crítico de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up p-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:text-orange-500 transition-all shadow-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-black text-slate-900 uppercase">
                        {isEdit ? 'Modificar' : 'Nuevo'} <span className="text-[#1e3a8a]">Nivel</span>
                    </h1>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-[#0f172a] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {isEdit ? 'ACTUALIZAR' : 'REGISTRAR'}
                </button>
            </div>

            <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 bg-[#f8fafc] flex items-center gap-3">
                    <Trophy className="text-[#1e3a8a]" size={20} />
                    <span className="font-black text-slate-800 text-xs uppercase">Configuración de Nivel</span>
                </div>
                <div className="p-8">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Nombre del Nivel</label>
                        <input
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Ej: ALTA COMPETENCIA"
                        />
                        <p className="text-[9px] text-slate-400 italic mt-2">
                            * El precio de este nivel se gestiona automáticamente desde el Catálogo de Servicios.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLevels;