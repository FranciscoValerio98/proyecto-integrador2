import React from 'react';
import { motion } from 'framer-motion';
import { Clock, BarChart3 } from 'lucide-react';

const AdminPaymentStats = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* ⏳ CONTROL OPERATIVO: Pendientes de Validación */}
            <div className="md:col-span-1 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-5 group hover:border-orange-400 transition-all duration-300">
                <div className="p-4 bg-orange-100 text-orange-600 rounded-3xl group-hover:bg-orange-500 group-hover:text-white transition-all shadow-inner">
                    <Clock size={32} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Por Validar</p>
                    <h2 className="text-4xl font-black text-slate-900 italic tracking-tighter">
                        {stats.pendientes}
                    </h2>
                    <p className="text-[8px] font-bold text-orange-500 uppercase mt-1 italic">Tickets en espera</p>
                </div>
            </div>

            {/* 📊 ANÁLISIS DINÁMICO: Gráfico de Ingresos Aprobados */}
            <div className="md:col-span-3 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                
                {/* Header del Gráfico */}
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-50 rounded-lg">
                            <BarChart3 size={18} className="text-[#1e3a8a]" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Análisis Mensual de Ingresos Reales</h3>
                    </div>
                    <div className="text-right">
                        <span className="text-[9px] font-black text-[#1e3a8a] bg-blue-50 px-3 py-1 rounded-full italic shadow-sm">
                            Pico: S/ {stats.maxRecaudacion.toFixed(0)}
                        </span>
                    </div>
                </div>

                {/* Área de Barras */}
                <div className="flex items-end gap-2 h-28 px-1 relative z-10">
                    {stats.chartData.map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center group/bar relative h-full justify-end">
                            
                            {/* Tooltip Pro al hacer Hover */}
                            <div className="absolute -top-10 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/bar:translate-y-0 bg-slate-900 text-white text-[10px] px-3 py-2 rounded-2xl font-black z-20 whitespace-nowrap shadow-2xl border border-white/10">
                                <span className="text-blue-400">{item.name}:</span> S/ {item.total.toLocaleString()}
                            </div>
                            
                            {/* Barra Animada con Graduación */}
                            <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${(item.total / (stats.maxRecaudacion || 1)) * 100}%` }}
                                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: idx * 0.04 }}
                                className={`w-full min-h-[8px] rounded-t-xl transition-all duration-500 relative overflow-hidden ${
                                    item.total > 0 
                                    ? 'bg-gradient-to-t from-[#1e3a8a] via-blue-600 to-blue-400 shadow-[0_0_15px_rgba(30,58,138,0.1)]' 
                                    : 'bg-slate-50'
                                }`}
                            >
                                {/* Brillo dinámico interno */}
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/bar:opacity-100 transition-opacity duration-300" />
                            </motion.div>
                            
                            {/* Etiqueta del Mes */}
                            <span className={`text-[8px] font-black mt-3 transition-colors duration-300 ${item.total > 0 ? 'text-slate-600' : 'text-slate-300'}`}>
                                {item.name}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Marca de agua decorativa de fondo */}
                <BarChart3 className="absolute -right-6 -bottom-6 text-slate-50 opacity-50 pointer-events-none" size={150} />
            </div>
        </div>
    );
};

export default AdminPaymentStats;