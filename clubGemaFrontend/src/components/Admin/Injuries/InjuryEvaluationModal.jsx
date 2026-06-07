import React, { useState } from 'react';
import { X, Check, AlertTriangle, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import lesionService from '../../../services/lesion.service';

const InjuryEvaluationModal = ({ isOpen, onClose, solicitud, onEvaluateSuccess }) => {
    const [evalData, setEvalData] = useState({
        estado: 'APROBADA',
        tipo: 'RANGO',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: '',
        notas: ''
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen || !solicitud) return null;

    const handleEvaluate = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await lesionService.evaluarSolicitud(solicitud.id, evalData);
            toast.success(`Solicitud ${evalData.estado === 'APROBADA' ? 'aprobada' : 'rechazada'} correctamente`);
            onEvaluateSuccess();
            onClose();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        /* z-[110] para estar por encima de la barra móvil y el sidebar */
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 md:p-6 bg-[#0f172a]/80 backdrop-blur-md animate-in fade-in duration-300">

            {/* AJUSTE CLAVE: 
                - En móvil (default): max-h-[80vh] y overflow-y-auto (para que no lo tape la barra inferior).
                - En PC (md:): max-h-none y h-auto (para que se vea completo y estirado).
            */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh] md:max-h-[95vh] lg:max-h-none h-auto overflow-hidden">

                {/* Botón Cerrar */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-400 hover:text-[#1e3a8a] z-[120] transition-colors p-2 hover:bg-slate-50 rounded-full"
                >
                    <X size={20} />
                </button>

                {/* Contenido con scroll condicional */}
                <div className="p-6 md:p-10 overflow-y-auto md:overflow-visible custom-scrollbar">

                    {/* Header Informativo */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-blue-50 text-[#1e3a8a] rounded-2xl shadow-sm">
                                <ClipboardList size={22} />
                            </div>
                            <h2 className="text-xl font-black text-[#1e3a8a] uppercase italic tracking-tighter leading-none">
                                Evaluar <span className="text-orange-500">Solicitud</span>
                            </h2>
                        </div>

                        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100 mt-4 shadow-inner">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-blue-700 flex items-center justify-center text-white font-black text-sm shadow-md italic">
                                {solicitud?.alumnos?.usuarios?.nombres?.charAt(0) || 'A'}
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Paciente en Revisión</p>
                                <p className="text-sm font-black text-slate-700 leading-none uppercase tracking-tighter">
                                    {solicitud?.alumnos?.usuarios?.nombres} {solicitud?.alumnos?.usuarios?.apellidos}
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleEvaluate} className="space-y-6">
                        {/* Selector de Estado Dual */}
                        <div className="grid grid-cols-2 gap-3 bg-slate-100/80 p-1.5 rounded-[1.5rem] border border-slate-200/50">
                            <button
                                type="button"
                                onClick={() => setEvalData({ ...evalData, estado: 'APROBADA' })}
                                className={`py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${evalData.estado === 'APROBADA' ? 'bg-white text-emerald-600 shadow-md ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Check size={14} strokeWidth={4} /> APROBAR
                            </button>
                            <button
                                type="button"
                                onClick={() => setEvalData({ ...evalData, estado: 'RECHAZADA' })}
                                className={`py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${evalData.estado === 'RECHAZADA' ? 'bg-white text-rose-600 shadow-md ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <X size={14} strokeWidth={4} /> RECHAZAR
                            </button>
                        </div>

                        {/* Campos Dinámicos */}
                        {evalData.estado === 'APROBADA' && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="bg-[#1e3a8a]/5 p-5 rounded-[1.5rem] border border-[#1e3a8a]/10">
                                    <label className="block text-[10px] font-black text-[#1e3a8a] uppercase tracking-widest mb-4">Alcance de la Justificación</label>
                                    <div className="flex gap-8">
                                        <label className="flex items-center gap-2.5 cursor-pointer group">
                                            <input type="radio" name="tipo" checked={evalData.tipo === 'RANGO'} onChange={() => setEvalData({ ...evalData, tipo: 'RANGO' })} className="w-4 h-4 accent-orange-500 shadow-sm" />
                                            <span className="text-xs font-black text-slate-600 group-hover:text-[#1e3a8a] uppercase tracking-tight">Temporal</span>
                                        </label>
                                        <label className="flex items-center gap-2.5 cursor-pointer group">
                                            <input type="radio" name="tipo" checked={evalData.tipo === 'INDEFINIDO'} onChange={() => setEvalData({ ...evalData, tipo: 'INDEFINIDO' })} className="w-4 h-4 accent-orange-500 shadow-sm" />
                                            <span className="text-xs font-black text-slate-600 group-hover:text-[#1e3a8a] uppercase tracking-tight">Indefinida</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha Inicio</label>
                                        <input type="date" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 text-xs focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-bold shadow-sm" value={evalData.fechaInicio} onChange={(e) => setEvalData({ ...evalData, fechaInicio: e.target.value })} />
                                    </div>
                                    {evalData.tipo === 'RANGO' && (
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha Final</label>
                                            <input type="date" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 text-xs focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-bold shadow-sm" value={evalData.fechaFin} onChange={(e) => setEvalData({ ...evalData, fechaFin: e.target.value })} />
                                        </div>
                                    )}
                                </div>

                                {evalData.tipo === 'INDEFINIDO' && (
                                    <div className="text-[9px] font-black text-amber-700 bg-amber-50 p-4 rounded-2xl border border-amber-200/50 flex gap-3 items-center uppercase tracking-wider leading-relaxed">
                                        <AlertTriangle size={18} className="shrink-0 text-amber-500" />
                                        <span>Suspensión de asistencia hasta fin de ciclo.</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dictamen y Observaciones</label>
                            <textarea rows="3" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-slate-700 text-xs focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-bold shadow-sm resize-none" placeholder="Indique los motivos de la decisión..." value={evalData.notas} onChange={(e) => setEvalData({ ...evalData, notas: e.target.value })} />
                        </div>

                        {/* Botón de acción final - Ajustado para no chocar con la nav bar móvil */}
                        <div className="pt-2 mb-2 md:mb-0">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#1e3a8a] hover:bg-[#0f172a] text-white font-black uppercase tracking-[0.25em] py-5 rounded-[1.5rem] shadow-2xl shadow-blue-900/30 transition-all disabled:opacity-50 active:scale-95 text-[11px] flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> PROCESANDO...</>
                                ) : (
                                    'CONFIRMAR EVALUACIÓN'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f8fafc;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default InjuryEvaluationModal;