import React, { useState } from 'react';
import { Upload, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import lesionService from '../../../services/lesion.service';

const InjuryRequestForm = ({ onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ descripcion: '', evidencia: null });
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.evidencia) {
            toast.error('Debes adjuntar una imagen de tu certificado médico.');
            return;
        }

        try {
            setLoading(true);

            const payload = new FormData();
            payload.append('descripcion', formData.descripcion);
            payload.append('evidencia', formData.evidencia);

            await lesionService.crearSolicitud(payload);

            toast.success('Solicitud enviada correctamente');
            setFormData({ descripcion: '', evidencia: null });
            setPreviewUrl(null);

            e.target.reset();

            if (onSuccess) onSuccess(); // Callback para avisar al padre que cambie de tab

        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-[#1e3a8a] to-[#142857] backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity className="text-orange-500" /> Detalle de la Lesión
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-blue-200 uppercase mb-2">Descripción del problema</label>
                    <textarea
                        required
                        rows="4"
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                        placeholder="Explica brevemente qué te pasó..."
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    />
                </div>

                {/* <div>
                    <label className="block text-xs font-bold text-blue-200 uppercase mb-2">Evidencia Médica</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Upload size={16} className="text-gray-500" />
                        </div>
                        <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            required
                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors
                            file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-gray-500 file:text-white hover:file:bg-gray-600 file:cursor-pointer cursor-pointer"
                            onChange={(e) => setFormData({ ...formData, evidencia: e.target.files[0] })}
                        />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 ml-1">
                        * Sube tu evidencia médica (JPG, PNG).
                    </p>
                </div> */}

                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Evidencia Médica</label>
                    <p className="text-[10px] text-gray-400 mt-2 ml-1">* Subir imagen (JPG, JPEG o PNG).</p>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="evidencia-input"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (e.target.files[0]) {
                                setFormData({ ...formData, evidencia: file });
                                setPreviewUrl(URL.createObjectURL(file));
                            }
                        }}
                    />
                    <label htmlFor="evidencia-input" className="block bg-black/20 border-2 border-dashed border-white/10 rounded-3xl py-8 text-center cursor-pointer hover:bg-gray-500 hover:border-gray-400 transition-all">
                        {previewUrl ? (
                            <img src={previewUrl} className="h-32 mx-auto rounded-2xl shadow-md" alt="Evidencia médica" />
                        ) : (
                            <>
                                <Upload size={32} className="mx-auto text-slate-300 mb-2" />
                                <p className="text-[10px] font-black text-slate-400 uppercase">Subir Foto</p>
                            </>
                        )}
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg shadow-orange-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                >
                    {loading ? 'Subiendo Evidencia...' : 'ENVIAR SOLICITUD'}
                </button>
            </form>
        </div>
    );
};

export default InjuryRequestForm;