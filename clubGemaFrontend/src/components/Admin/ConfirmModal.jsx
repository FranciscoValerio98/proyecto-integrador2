import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, iconType = 'warning', confirmText = 'Confirmar' }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop con desenfoque */}
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                
                {/* Tarjeta del Modal */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
                >
                    <div className="p-8 text-center">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 mx-auto ${
                            iconType === 'danger' ? 'bg-red-50 text-red-500 animate-bounce' : 'bg-orange-50 text-orange-500'
                        }`}>
                            {iconType === 'danger' ? <ShieldAlert size={40} /> : <AlertTriangle size={40} />}
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic mb-3">
                            {title}
                        </h3>
                        <p className="text-slate-500 text-sm font-bold leading-relaxed mb-10 px-4">
                            {message}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button 
                                onClick={onClose}
                                className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors order-2 sm:order-1"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={onConfirm}
                                className={`flex-[2] px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 order-1 sm:order-2 ${
                                    iconType === 'danger' ? 'bg-red-600 shadow-red-200' : 'bg-[#1e3a8a] shadow-blue-200'
                                }`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmModal;