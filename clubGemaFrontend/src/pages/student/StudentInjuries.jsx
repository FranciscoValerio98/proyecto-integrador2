import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import lesionService from '../../services/lesion.service';
// Importamos los componentes
import InjuryRequestForm from '../../components/student/Injuries/InjuryRequestForm';
import InjuryHistoryItem from '../../components/student/Injuries/InjuryHistoryItem';
import { Link } from 'react-router-dom';

const StudentInjuries = () => {
    const [activeTab, setActiveTab] = useState('request');
    const [loading, setLoading] = useState(false);
    const [solicitudes, setSolicitudes] = useState([]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const data = await lesionService.obtenerMisSolicitudes();
            setSolicitudes(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'history') fetchHistory();
    }, [activeTab]);

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <Link to="/dashboard/student" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#1e3a8a] transition-all mb-4 text-[10px] font-black uppercase tracking-widest italic">
                <ArrowLeft size={14} /> Volver
            </Link>

            <div className="mb-8">
                <h1 className="text-4xl font-black text-[#1e3a8a] italic uppercase tracking-tighter">
                    Gestión de <span className="text-orange-500">Lesiones</span>
                </h1>
            </div>

            <div className="flex gap-4 mb-8 border-b border-white/10">
                {['request', 'history'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 px-4 text-sm font-bold transition-all ${activeTab === tab ? 'text-orange-500 border-b-2 border-orange-500' : 'text-slate-400 hover:text-slate-300'}`}
                    >
                        {tab === 'request' ? 'Nueva Solicitud' : 'Historial'}
                    </button>
                ))}
            </div>

            {activeTab === 'request' ? (
                <div className="grid md:grid-cols-2 gap-8">
                    <InjuryRequestForm onSuccess={() => setActiveTab('history')} />

                    <div className="bg-blue-100 border border-blue-200 rounded-2xl p-6 h-fit">
                        <h4 className="font-bold text-[#1e3a8a] mb-4 flex items-center gap-2">
                            <AlertCircle size={20} /> Información Importante
                        </h4>
                        <ul className="space-y-3 text-sm font-semibold text-slate-500">
                            <li className="flex gap-2"><span className="text-slate-500">•</span> Cualquier tipo de solicitud debe ser evidenciada.</li>
                            <li className="flex gap-2"><span className="text-slate-500">•</span> Revisión de solicitud dentro de las 24 horas.</li>
                            <li className="flex gap-2"><span className="text-slate-500">•</span> Las recuperaciones por lesión no tienen límite.</li>
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-white text-center py-10">Cargando...</div>
                    ) : solicitudes.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 bg-white/5 rounded-2xl border border-white/5">Sin solicitudes.</div>
                    ) : (
                        solicitudes.map((sol) => <InjuryHistoryItem key={sol.id} solicitud={sol} />)
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentInjuries;