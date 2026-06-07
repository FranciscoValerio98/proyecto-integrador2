import React, { useState, useEffect } from 'react';
import { 
    CalendarClock, 
    CalendarX2,
    Users,
    MapPin,
    AlertCircle,
    FastForward,
    User,
    Loader2
} from 'lucide-react';
import apiFetch from '../../interceptors/api';
import { API_ROUTES } from '../../constants/apiRoutes';
import toast from 'react-hot-toast';

const MassRescheduleHistory = ({ refreshSignal }) => { // 📥 Recibe la señal
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // 🔥 Reacciona cuando refreshSignal cambia en el padre
    useEffect(() => {
        fetchHistory();
    }, [refreshSignal]);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const response = await apiFetch.get(API_ROUTES.CLASES.ACTIVAS_MASIVAS);
            const json = await response.json();
            setHistory(json.data || json || []);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatearFechaUTC = (fechaStr) => {
        if (!fechaStr) return 'S/F';
        const date = new Date(fechaStr);
        return `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date.getUTCFullYear()}`;
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-3">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Actualizando...</p>
        </div>
    );

    if (history.length === 0) return (
        <div className="p-10 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200">
            <CalendarX2 className="mx-auto text-slate-300 mb-2" size={40} />
            <p className="text-[10px] font-black text-slate-400 uppercase italic">Sin registros</p>
        </div>
    );

    return (
        <div className="space-y-5 px-2">
            {history.map((item) => (
                <div key={item.id} className="bg-white rounded-[2.2rem] border border-slate-200 shadow-sm p-6 relative overflow-hidden transition-all hover:border-blue-200">
                    <div className="flex justify-between items-center mb-5">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificador</span>
                            <h4 className="text-xs font-black text-[#1e3a8a] italic uppercase">Lote {item.grupo_uuid?.split('-')[0]}</h4>
                        </div>
                        <div className="bg-[#1e3a8a] px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg">
                            <Users size={16} className="text-blue-300" />
                            <span className="text-white font-black text-sm">{item._count?.registros_asistencia || 0}</span>
                            <span className="text-[8px] text-blue-200 font-bold uppercase tracking-tighter">Afectados</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-2xl border border-slate-100 p-4 mb-4">
                        <div className="border-r border-slate-200 pr-2">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Cancelada</span>
                            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase">
                                <CalendarClock size={14} className="text-red-500" />
                                {formatearFechaUTC(item.fecha_origen)}
                            </div>
                        </div>
                        <div className="pl-2 text-right">
                            <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest mb-1 block">Acción</span>
                            <div className="flex items-center gap-1 text-orange-600 font-black text-[9px] uppercase italic justify-end">
                                <FastForward size={14} /> Ciclo +7 Días
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-x-4">
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase">
                                <MapPin size={12} className="text-blue-500" />
                                {item.horarios_clases?.canchas?.nombre}
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase">
                                <User size={12} />
                                {item.usuarios?.nombres}
                            </div>
                        </div>

                        <div className="bg-blue-50/50 p-4 rounded-2xl border-l-4 border-blue-500 relative">
                            <AlertCircle size={14} className="text-blue-500 absolute -top-1.5 -left-1.5 bg-white rounded-full" />
                            <p className="text-[10px] text-slate-700 italic font-bold leading-relaxed">"{item.motivo}"</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MassRescheduleHistory;