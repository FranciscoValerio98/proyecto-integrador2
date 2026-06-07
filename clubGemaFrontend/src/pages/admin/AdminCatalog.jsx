import React, { useState, useEffect } from 'react';
import { Save, Tag, DollarSign, Hash, CalendarDays, ArrowLeft, Package, RefreshCcw } from 'lucide-react';
import { apiFetch } from '../../interceptors/api';
import toast from 'react-hot-toast';
import { API_ROUTES } from '../../constants/apiRoutes';

const AdminCatalog = ({ onBack, editData }) => {
    const [loading, setLoading] = useState(false);
    const isEditing = !!editData;

    const [formData, setFormData] = useState({
        nombre: '',
        codigo_interno: '',
        precio_base: '',
        cantidad_clases_semanal: '',
        es_vigente: true
    });

    // Cargar datos si estamos editando
    useEffect(() => {
        if (editData) {
            setFormData({
                nombre: editData.nombre,
                codigo_interno: editData.codigo_interno || '',
                precio_base: editData.precio_base,
                cantidad_clases_semanal: editData.cantidad_clases_semanal,
                es_vigente: editData.es_vigente
            });
        }
    }, [editData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        const payload = {
            nombre: formData.nombre,
            codigo_interno: formData.codigo_interno || null,
            precio_base: parseFloat(formData.precio_base),
            cantidad_clases_semanal: parseInt(formData.cantidad_clases_semanal) || 0,
            es_vigente: formData.es_vigente
        };

        try {
            const method = isEditing ? 'PUT' : 'POST';
            const endpoint = isEditing ? API_ROUTES.CATALOGO.BY_ID(editData.id) : API_ROUTES.CATALOGO.BASE;

            const response = await apiFetch[method.toLowerCase()](endpoint, payload);

            if (response.ok) {
                toast.success(isEditing ? "¡Concepto actualizado!" : "¡Concepto creado!");
                onBack();
            } else {
                toast.error("Error al procesar la solicitud");
            }
        } catch (error) {
            toast.error("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up p-1 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="group flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-xl hover:border-[#1e3a8a] transition-all shadow-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <div className="h-5 w-1 bg-orange-500 rounded-full"></div>
                            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                {isEditing ? 'Editar' : 'Nuevo'} <span className="text-[#1e3a8a]">Concepto</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-3 italic">
                            Lógica interna de precios - Club Gema
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading || !formData.nombre || !formData.precio_base}
                    className="bg-gradient-to-r from-[#1e3a8a] to-[#0f172a] hover:from-orange-500 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-black uppercase italic text-xs flex items-center gap-2 transition-all shadow-xl disabled:opacity-50"
                >
                    {loading ? <RefreshCcw size={18} className="animate-spin" /> : <Save size={18} />}
                    {isEditing ? 'ACTUALIZAR CAMBIOS' : 'GUARDAR CONCEPTO'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-[#f8fafc] flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-[#1e3a8a] rounded-lg"><Tag size={20} /></div>
                            <h3 className="font-black text-[#1e3a8a] uppercase text-xs tracking-wider italic">Configuración de Producto</h3>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre Descriptivo</label>
                                <input name="nombre" value={formData.nombre} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#1e3a8a] uppercase" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Código de Referencia</label>
                                <div className="relative">
                                    <Hash size={14} className="absolute left-4 top-3.5 text-slate-400" />
                                    <input name="codigo_interno" value={formData.codigo_interno} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold outline-none" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Precio Unitario (S/.)</label>
                                <div className="relative">
                                    <DollarSign size={14} className="absolute left-4 top-3.5 text-green-600" />
                                    <input name="precio_base" type="number" value={formData.precio_base} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-black text-slate-700 outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-[#f8fafc] flex items-center gap-3">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><CalendarDays size={20} /></div>
                            <h3 className="font-black text-[#1e3a8a] uppercase text-xs tracking-wider italic">Vigencia y Frecuencia</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Clases Semanales</label>
                                <input name="cantidad_clases_semanal" type="number" value={formData.cantidad_clases_semanal} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
                            </div>
                            <div className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${formData.es_vigente ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <label className="text-[10px] font-black uppercase text-slate-600">¿Concepto Activo?</label>
                                <input type="checkbox" name="es_vigente" checked={formData.es_vigente} onChange={handleChange} className="w-6 h-6 rounded-md text-[#1e3a8a]" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0f172a] p-6 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
                        <Package size={80} className="absolute -right-4 -bottom-4 opacity-10 rotate-12" />
                        <p className="text-[10px] font-black uppercase text-orange-500 mb-2">Aviso Importante</p>
                        <p className="text-[10px] font-bold leading-relaxed opacity-80 uppercase italic">
                            Cualquier cambio en el precio base afectará únicamente a las NUEVAS deudas generadas.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCatalog;