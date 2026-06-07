import React, { useState } from 'react';
import { Plus, MapPin, Home, Phone, Trash2, Save, Map, ArrowLeft } from 'lucide-react';
import { sedeService } from '../../services/sede.service';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const AdminLocations = ({ onSuccess, initialData }) => {
    const [loading, setLoading] = useState(false);
    const isEdit = !!initialData;

    const { userId } = useAuth();

    const [formData, setFormData] = useState({
        nombre: initialData?.nombre || '',
        telefono_contacto: initialData?.telefono_contacto || '',
        tipo_instalacion: initialData?.tipo_instalacion || '',
        direccion_completa: initialData?.direcciones?.direccion_completa || '',
        distrito: initialData?.direcciones?.distrito || '',
        ciudad: initialData?.direcciones?.ciudad || 'Lima',
        referencia: initialData?.direcciones?.referencia || '',
        // Mapeamos las canchas existentes o iniciamos una vacía
        canchas: initialData?.canchas?.length > 0
            ? initialData.canchas.map(c => ({ id: c.id, nombre: c.nombre, descripcion: c.descripcion }))
            : [{ nombre: '', descripcion: '' }]
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCanchaChange = (index, e) => {
        const { name, value } = e.target;
        const nuevasCanchas = [...formData.canchas];
        nuevasCanchas[index][name] = value;
        setFormData(prev => ({ ...prev, canchas: nuevasCanchas }));
    };

    const addCancha = () => {
        setFormData(prev => ({
            ...prev,
            canchas: [...prev.canchas, { nombre: '', descripcion: '' }]
        }));
    };

    const removeCancha = (index) => {
        if (formData.canchas.length > 1) {
            const nuevasCanchas = formData.canchas.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, canchas: nuevasCanchas }));
        }
    };

    const handleSubmit = async () => {
        const canchasFiltradas = formData.canchas
            .filter(c => c.nombre && c.nombre.trim() !== '')
            .map(c => ({
                id: c.id,
                nombre: c.nombre.trim(),
                descripcion: c.descripcion ? c.descripcion.trim() : ''
            }));

        // 2. Validación básica antes de disparar el loading
        if (canchasFiltradas.length === 0) {
            toast.error("Debes agregar al menos\nuna cancha con nombre.");
            return;
        }

        if (!formData.distrito) {
            toast.error("Por favor selecciona\nun distrito.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                nombre: formData.nombre.trim(),
                telefono_contacto: formData.telefono_contacto,
                tipo_instalacion: formData.tipo_instalacion,
                administrador_id: Number(userId),
                direccion: {
                    direccion_completa: formData.direccion_completa,
                    distrito: formData.distrito,
                    ciudad: formData.ciudad || 'Lima',
                    referencia: formData.referencia
                },
                canchas: canchasFiltradas
            };

            if (isEdit) {
                // LLAMADA A UPDATE
                await sedeService.update(initialData.id, payload);
                toast.success("Sede actualizada correctamente");
            } else {
                // LLAMADA A CREATE
                await sedeService.create(payload);
                toast.success("Sede creada correctamente");
            }

            // Si el backend responde 201, disparamos el éxito
            if (onSuccess) onSuccess();

        } catch (error) {
            const backendMessage = error.message || "Error en los datos";
            const message = backendMessage.includes("horarios o inscripciones")
                ? `${backendMessage}. Reasigna o elimina esos horarios antes de actualizar la sede.`
                : backendMessage;
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const UBI_DATA = {
        "Lima": [
            "Ancón", "Ate", "Barranco", "Breña", "Carabayllo", "Chaclacayo", "Chorrillos",
            "Cieneguilla", "Comas", "El Agustino", "Independencia", "Jesús María",
            "La Molina", "La Victoria", "Lima (Cercado)", "Lince", "Los Olivos",
            "Lurigancho-Chosica", "Lurín", "Magdalena del Mar", "Miraflores",
            "Pachacámac", "Pucusana", "Pueblo Libre", "Puente Piedra", "Punta Hermosa",
            "Punta Negra", "Rímac", "San Bartolo", "San Borja", "San Isidro",
            "San Juan de Lurigancho", "San Juan de Miraflores", "San Luis",
            "San Martín de Porres", "San Miguel", "Santa Anita", "Santa María del Mar",
            "Santa Rosa", "Santiago de Surco", "Surquillo", "Villa El Salvador",
            "Villa María del Triunfo"
        ],
        "Arequipa": [
            "Arequipa (Cercado)", "Alto Selva Alegre", "Cayma", "Cerro Colorado",
            "Characato", "Chiguata", "Jacobo Hunter", "José Luis Bustamante y Rivero",
            "La Joya", "Mariano Melgar", "Miraflores", "Mollebaya", "Paucarpata",
            "Pocsi", "Polobaya", "Quequeña", "Sabandía", "Sachaca", "San Juan de Siguas",
            "San Juan de Tarucani", "Santa Isabel de Siguas", "Santa Rita de Siguas",
            "Socabaya", "Tiabaya", "Uchumayo", "Vítor", "Yanahuara", "Yarabamba", "Yura"
        ],
        "Trujillo": [
            "Trujillo (Cercado)", "El Porvenir", "Florencia de Mora", "Huanchaco",
            "La Esperanza", "Laredo", "Moche", "Poroto", "Salaverry", "Simbal",
            "Víctor Larco Herrera"
        ]
    };

    return (
        <div className="space-y-6 animate-fade-in-up p-1">
            {/* Header con botón de volver */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <button
                    onClick={handleSubmit}
                    disabled={loading || !formData.nombre}
                    className="bg-gradient-to-r from-[#1e3a8a] to-[#0f172a] hover:from-orange-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 shadow-lg shadow-blue-900/20 group"
                >
                    <Save size={20} />
                    {loading ? 'Guardando...' : isEdit ? 'Actualizar Sede' : 'Finalizar Registro'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Información General */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-[#f8fafc] flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-[#1e3a8a] rounded-lg">
                                <Home size={20} />
                            </div>
                            <h3 className="font-black text-[#1e3a8a] uppercase tracking-wider text-sm">Información General</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre de la Sede</label>
                                <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Sede Central" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Teléfono</label>
                                <div className="relative">
                                    <Phone size={14} className="absolute left-4 top-3 text-slate-400" />
                                    <input name="telefono_contacto" value={formData.telefono_contacto} onChange={handleChange} placeholder="999 999 999" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tipo de Instalación</label>
                                <input name="tipo_instalacion" value={formData.tipo_instalacion} onChange={handleChange} placeholder="Ej: Club Deportivo / Complejo Techado" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Ubicación */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-[#f8fafc] flex items-center gap-3">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                <MapPin size={20} />
                            </div>
                            <h3 className="font-black text-[#1e3a8a] uppercase tracking-wider text-sm">Ubicación Exacta</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Dirección Completa</label>
                                <input name="direccion_completa" value={formData.direccion_completa} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                            </div>
                            {/* Ciudad Select */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Ciudad</label>
                                <select
                                    name="ciudad"
                                    value={formData.ciudad}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, ciudad: e.target.value, distrito: '' }));
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none appearance-none"
                                >
                                    <option value="">Seleccione Ciudad</option>
                                    {Object.keys(UBI_DATA).map(ciudad => (
                                        <option key={ciudad} value={ciudad}>{ciudad}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Distrito Select */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Distrito</label>
                                <select
                                    name="distrito"
                                    value={formData.distrito}
                                    onChange={handleChange}
                                    disabled={!formData.ciudad}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none appearance-none disabled:opacity-50"
                                >
                                    <option value="">Seleccione Distrito</option>
                                    {formData.ciudad && UBI_DATA[formData.ciudad].map(dist => (
                                        <option key={dist} value={dist}>{dist}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Referencia</label>
                                <input name="referencia" value={formData.referencia} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Canchas (Derecha) */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-[#f8fafc] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-[#1e3a8a] rounded-lg"><Map size={20} /></div>
                                <h3 className="font-black text-[#1e3a8a] uppercase tracking-wider text-sm">Canchas</h3>
                            </div>
                            <button onClick={addCancha} className="p-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md shadow-orange-200"><Plus size={18} /></button>
                        </div>
                        <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                            {formData.canchas.map((cancha, index) => (
                                <div key={index} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 relative group">
                                    <button onClick={() => removeCancha(index)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Nombre</label>
                                        <input name="nombre" value={cancha.nombre} onChange={(e) => handleCanchaChange(index, e)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-[#1e3a8a]" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Descripción</label>
                                        <input name="descripcion" value={cancha.descripcion} onChange={(e) => handleCanchaChange(index, e)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-[#1e3a8a]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Widget de Resumen */}
                    <div className="bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="font-black uppercase italic tracking-tighter text-xl mb-2">Resumen</h4>
                            <div className="space-y-2 opacity-80 text-xs font-bold uppercase">
                                <p className="flex justify-between">Canchas a crear: <span>{formData.canchas.length}</span></p>
                                <p className="flex justify-between">Ubicación: <span>{formData.distrito || '---'}</span></p>
                            </div>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12"><MapPin size={120} /></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLocations;
