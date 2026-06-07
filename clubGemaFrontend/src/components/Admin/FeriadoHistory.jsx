import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Calendar as CalendarIcon, Trash2, Plus, Loader2, AlertCircle } from 'lucide-react';
import { feriadoService } from '../../services/feriado.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const FeriadoHistory = ({ onClose }) => {
    const [feriados, setFeriados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newFeriado, setNewFeriado] = useState({ fecha: '', descripcion: '' });

    // 🛠️ FUNCIÓN CLAVE: Corrige el desfase de zona horaria (UTC vs Local)
    const parseLocalDate = (dateString) => {
        if (!dateString) return new Date();
        const date = new Date(dateString);
        // Ajustamos los minutos de diferencia para que no retroceda un día
        return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    };

    // Memoizar el ordenamiento: lo más reciente arriba
    const feriadosOrdenados = useMemo(() => {
        return [...feriados].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }, [feriados]);

    const fetchFeriados = useCallback(async () => {
        try {
            setLoading(true);
            const result = await feriadoService.listarTodos();
            setFeriados(result?.data || []);
        } catch (error) {
            console.error("Error cargando feriados:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFeriados();
    }, [fetchFeriados]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newFeriado.fecha || !newFeriado.descripcion) return;
        
        try {
            setSubmitting(true);
            await feriadoService.crear(newFeriado);
            setNewFeriado({ fecha: '', descripcion: '' });
            await fetchFeriados(); 
        } catch (error) {
            console.error("Error al guardar:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm("¿Eliminar este feriado?")) return;
        try {
            await feriadoService.eliminar(id);
            setFeriados(prev => prev.filter(f => f.id !== id));
        } catch (error) {
            alert("No se pudo eliminar");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500 rounded-xl text-white shadow-lg shadow-orange-200">
                            <CalendarIcon size={20} />
                        </div>
                        <h2 className="font-black text-slate-800 uppercase tracking-tighter text-xl italic">
                            Feriados <span className="text-orange-500">GEMA</span>
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6 bg-white border-b border-slate-50 shrink-0 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <input 
                            type="date" 
                            required
                            value={newFeriado.fecha}
                            onChange={(e) => setNewFeriado({...newFeriado, fecha: e.target.value})}
                            className="bg-slate-100 border-none rounded-xl text-sm font-bold p-3 outline-none focus:ring-2 focus:ring-orange-500/20"
                        />
                        <input 
                            type="text" 
                            placeholder="Ej: Navidad" 
                            required
                            value={newFeriado.descripcion}
                            onChange={(e) => setNewFeriado({...newFeriado, descripcion: e.target.value})}
                            className="bg-slate-100 border-none rounded-xl text-sm font-bold p-3 outline-none focus:ring-2 focus:ring-orange-500/20"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-slate-200"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={14}/> : <Plus size={14}/>}
                        Registrar Feriado
                    </button>
                </form>

                {/* Lista con Scroll */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 custom-scrollbar">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">
                        Próximas fechas no laborables
                    </p>
                    
                    {loading ? (
                        <div className="py-20 flex flex-col items-center text-slate-400">
                            <Loader2 className="animate-spin mb-2" size={24} />
                            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Sincronizando...</span>
                        </div>
                    ) : feriadosOrdenados.length === 0 ? (
                        <div className="py-20 flex flex-col items-center text-slate-300">
                            <AlertCircle size={40} className="mb-2 opacity-20" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">Sin registros</span>
                        </div>
                    ) : (
                        <div className="space-y-2 pb-4">
                            {feriadosOrdenados.map((f) => {
                                // 💡 Aplicamos la corrección aquí
                                const localDate = parseLocalDate(f.fecha);
                                return (
                                    <div key={f.id} className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-orange-200 transition-all shadow-sm hover:shadow-md">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex flex-col items-center justify-center text-[10px] font-black text-slate-600 shadow-sm border border-white">
                                                <span>{format(localDate, 'dd')}</span>
                                                <span className="uppercase text-orange-500">{format(localDate, 'MMM', {locale: es})}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-700 leading-tight">{f.descripcion}</p>
                                                <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter italic">
                                                    Ciclo {format(localDate, 'yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleEliminar(f.id)} 
                                            className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeriadoHistory;