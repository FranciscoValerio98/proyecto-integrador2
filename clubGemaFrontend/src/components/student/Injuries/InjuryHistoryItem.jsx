import React from 'react';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

const InjuryHistoryItem = ({ solicitud }) => {
    const getStatusBadge = (status) => {
        switch (status) {
            case 'APROBADA': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-200 text-green-600 border border-green-500/50 flex items-center gap-1"><CheckCircle size={12} /> Aprobada</span>;
            case 'RECHAZADA': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-200 text-red-600 border border-red-500/50 flex items-center gap-1"><XCircle size={12} /> Rechazada</span>;
            default: return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-200 text-yellow-600 border border-yellow-500/50 flex items-center gap-1"><Clock size={12} /> Pendiente</span>;
        }
    };

    return (
        <div className="group bg-white border border-gray-200 rounded-3xl p-6 flex flex-col shadow-xl md:flex-row justify-between items-start md:items-center gap-4 hover:border-[#1e3a8a] hover:bg-[#1e3a8a] transition-all duration-300">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    {getStatusBadge(solicitud.estado)}
                    <span className="text-xs text-gray-500 group-hover:text-white transition-colors">{new Date(solicitud.fecha_solicitud).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-600 font-medium group-hover:text-white transition-colors">{solicitud.descripcion_lesion}</p>
                {solicitud.notas_admin && (
                    <p className="text-sm text-orange-600 mt-2 bg-orange-200 p-2 rounded-lg border border-orange-500/20">
                        <span className="font-bold">Admin:</span> {solicitud.notas_admin}
                    </p>
                )}
            </div>
            <a
                href={solicitud.url_evidencia_medica}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-400 bg-blue-200 px-3 py-2 rounded-lg border border-blue-500/20 transition-all shrink-0"
            >
                <FileText size={14} /> Ver Evidencia
            </a>
        </div>
    );
};

export default InjuryHistoryItem;