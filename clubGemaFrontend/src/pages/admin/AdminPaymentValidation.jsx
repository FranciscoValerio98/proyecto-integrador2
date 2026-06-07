import React, { useState, useMemo } from 'react';
import { 
    ArrowLeft, CheckCircle, Eye, Loader2, DollarSign, 
    User, ExternalLink, Calendar, MapPin, Clock, Info, Check, ArrowRight, ShieldCheck, AlertCircle, Activity
} from 'lucide-react';
import { apiFetch } from '../../interceptors/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { API_ROUTES } from '../../constants/apiRoutes';

const AdminPaymentValidation = ({ onBack, paymentData, onSuccess }) => {
    const { userId } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showDateModal, setShowDateModal] = useState(false);
    
    const [validationStatus, setValidationStatus] = useState(paymentData?.estado_validacion || 'PENDIENTE');
    const [notas, setNotas] = useState(paymentData?.notas_validacion || '');
    const [montoConfirmado, setMontoConfirmado] = useState(paymentData?.monto_pagado || 0);

    const hoyLocal = new Date().toLocaleDateString('sv-SE'); 
    const [fechaInicioClases, setFechaInicioClases] = useState(
        paymentData?.cuentas_por_cobrar?.inscripciones_deudas_link[0]?.inscripciones?.fecha_inscripcion || hoyLocal
    );

    const [inscripcionesVinculadas, setInscripcionesVinculadas] = useState(
        paymentData?.cuentas_por_cobrar?.inscripciones_deudas_link || []
    );

    // 🔥 LÓGICA DE ALCANCÍA ACUMULATIVA
    const infoFinanciera = useMemo(() => {
        const deudaTotal = Number(paymentData?.cuentas_por_cobrar?.monto_final || 0);
        const montoIngresadoHoy = Number(montoConfirmado || 0);
        
        // Sumamos pagos previos ya aprobados
        const otrosPagosAprobados = (paymentData?.cuentas_por_cobrar?.pagos || [])
            .filter(p => p.id !== paymentData.id && p.estado_validacion === 'APROBADO')
            .reduce((acc, curr) => acc + Number(curr.monto_pagado), 0);

        const totalPagadoProyectado = otrosPagosAprobados + montoIngresadoHoy;
        const saldoRestante = deudaTotal - totalPagadoProyectado;
        const esPagoCompleto = saldoRestante <= 0.05; 

        // 🛡️ REGLA: ¿Es este el primer abono real?
        const esPrimerPago = otrosPagosAprobados === 0;

        return {
            deudaTotal,
            otrosPagosAprobados,
            totalPagadoProyectado,
            saldoRestante: saldoRestante < 0 ? 0 : saldoRestante,
            esPagoCompleto,
            esPrimerPago // 👈 Flag para mostrar/ocultar el botón de fecha
        };
    }, [paymentData, montoConfirmado]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
    };

    const formatFechaLocal = (fechaInput) => {
        if (!fechaInput) return 'Pendiente';
        const stringLimpio = typeof fechaInput === 'string' ? fechaInput.split('T')[0] : fechaInput;
        const partes = stringLimpio.split('-');
        return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : '---';
    };

    const renderHoraLimpia = (horaInput) => {
        if (!horaInput) return '--:--';
        return horaInput.toString().includes('T') ? horaInput.split('T')[1].slice(0, 5) : horaInput.toString().slice(0, 5);
    };

    const calcularFechaFin = (fechaInic) => {
        if(!fechaInic) return null;
        const d = new Date(fechaInic);
        d.setDate(d.getDate() + 30); 
        return d.toLocaleDateString('sv-SE');
    };

    const handleApplyNewDate = () => {
        const actualizadas = inscripcionesVinculadas.map(item => ({
            ...item,
            inscripciones: { ...item.inscripciones, fecha_inscripcion: fechaInicioClases }
        }));
        setInscripcionesVinculadas(actualizadas);
        setShowDateModal(false);
        toast.success("Ciclo sincronizado", { icon: '📅' });
    };

    const handleVerify = async () => {
        if (validationStatus === 'PENDIENTE') return toast.error("Elige APROBADO o RECHAZADO");
        setLoading(true);
        try {
            // Solo intentamos actualizar la fecha si es el primer pago
            if (validationStatus === 'APROBADO' && infoFinanciera.esPrimerPago) {
                await apiFetch.patch(
                    API_ROUTES.INSCRIPCIONES.ACTUALIZAR_FECHA_PAQUETE(paymentData.cuenta_id), 
                    { nuevaFecha: fechaInicioClases }
                );
            }

            const payload = {
                pago_id: paymentData.id,
                accion: validationStatus === 'APROBADO' ? 'APROBAR' : 'RECHAZAR',
                usuario_admin_id: userId,
                notas: notas,
                monto_real_confirmado: parseFloat(montoConfirmado)
            };

            const response = await apiFetch.post(API_ROUTES.PAGOS.VALIDAR, payload);
            if (response.ok) {
                toast.success(infoFinanciera.esPagoCompleto ? "Pago Total Liquidado 🎉" : "Abono Parcial Registrado ✅");
                if (onSuccess) onSuccess();
                onBack();
            }
        } catch (e) {
            toast.error("Error en la validación");
        } finally {
            setLoading(false);
        }
    };

    const alumno = paymentData?.cuentas_por_cobrar?.alumnos?.usuarios;

    return (
        <div className="space-y-6 animate-fade-in-up pb-20 relative">
            
            {showDateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
                    <div className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl border-t-[12px] border-orange-500 animate-bounce-in">
                        <div className="text-center mb-8">
                            <div className="bg-orange-100 w-20 h-20 rounded-3xl text-orange-600 flex items-center justify-center mx-auto mb-4">
                                <Calendar size={40} />
                            </div>
                            <h3 className="text-2xl font-black uppercase italic text-slate-800">Definir Inicio de Clases</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Solo disponible para el primer abono</p>
                        </div>

                        <div className="space-y-6">
                            <input 
                                type="date" 
                                className="w-full bg-slate-50 border-4 border-slate-100 rounded-[2rem] px-8 py-5 font-black text-[#1e3a8a] text-xl outline-none focus:border-orange-500 text-center"
                                value={fechaInicioClases}
                                onChange={(e) => setFechaInicioClases(e.target.value)}
                            />
                            <button 
                                onClick={handleApplyNewDate}
                                className="w-full bg-orange-500 text-white py-5 rounded-[2rem] font-black uppercase italic shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-3"
                            >
                                ESTABLECER FECHA <Check size={20} />
                            </button>
                            <button onClick={() => setShowDateModal(false)} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest">Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100 gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button onClick={onBack} className="p-3 bg-slate-50 rounded-2xl text-slate-600 hover:bg-slate-200 transition-all"><ArrowLeft size={20} /></button>
                    <h1 className="text-xl font-black text-slate-800 uppercase italic">Revisión de <span className="text-blue-600">Pago</span></h1>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                    {validationStatus === 'APROBADO' && (
                        <div className={`flex-1 md:flex-none px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase italic border-2 text-center ${infoFinanciera.esPagoCompleto ? 'bg-green-50 border-green-200 text-green-700' : 'bg-orange-50 border-orange-200 text-orange-700 animate-pulse'}`}>
                            {infoFinanciera.esPagoCompleto ? '✅ Deuda Saldada' : `⚠️ Restante: ${formatCurrency(infoFinanciera.saldoRestante)}`}
                        </div>
                    )}
                    <button
                        onClick={handleVerify}
                        disabled={loading || validationStatus === 'PENDIENTE'}
                        className="bg-[#1e3a8a] hover:bg-green-600 text-white px-10 py-4 rounded-2xl font-black uppercase italic text-xs shadow-xl flex items-center gap-2 transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                        Validar Transacción
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 relative overflow-hidden">
                        <div className="bg-blue-600 p-4 rounded-[2.5rem] text-white shadow-lg"><User size={38} /></div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest leading-none mb-1">Alumno</p>
                            <h2 className="text-2xl font-black uppercase italic text-slate-800 leading-none">{alumno?.nombres} {alumno?.apellidos}</h2>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-slate-50 pb-6">
                            <div>
                                <h3 className="font-black uppercase italic text-slate-800 text-lg tracking-tighter">Detalle de Inscripción</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Ubicación y Cronograma seleccionado</p>
                            </div>
                            
                            {/* 🚩 REGLA DE ORO: Solo mostramos el botón si NO hay abonos previos */}
                            {infoFinanciera.esPrimerPago ? (
                                <button onClick={() => setShowDateModal(true)} className="bg-orange-500 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase italic hover:bg-slate-900 transition-all flex items-center gap-2 shadow-lg shadow-orange-200">
                                    <Calendar size={14} /> AJUSTAR FECHA DE INICIO
                                </button>
                            ) : (
                                <div className="bg-blue-50 px-5 py-3 rounded-2xl border border-blue-100 flex items-center gap-2">
                                    <ShieldCheck size={16} className="text-blue-500" />
                                    <span className="text-[9px] font-black text-blue-600 uppercase italic">Ciclo ya iniciado (Abono previo)</span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {inscripcionesVinculadas.map((link, idx) => {
                                const h = link.inscripciones?.horarios_clases;
                                const diasSemana = ['', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
                                
                                return (
                                    <div key={idx} className="bg-slate-50 p-6 rounded-[2.5rem] border-2 border-slate-50 hover:bg-white hover:border-blue-200 transition-all">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                                <div className="text-center flex-1">
                                                    <p className="text-[7px] font-black text-slate-400 uppercase">Inicia</p>
                                                    <p className="text-[10px] font-black text-[#1e3a8a]">{formatFechaLocal(fechaInicioClases)}</p>
                                                </div>
                                                <ArrowRight size={14} className="text-slate-300" />
                                                <div className="text-center flex-1">
                                                    <p className="text-[7px] font-black text-slate-400 uppercase">Vence</p>
                                                    <p className="text-[10px] font-black text-orange-600">{formatFechaLocal(calcularFechaFin(fechaInicioClases))}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2 pt-2">
                                                <div className="flex items-start gap-2">
                                                    <MapPin size={14} className="text-blue-500 mt-0.5" />
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-800 uppercase leading-none">{h?.canchas?.sedes?.nombre}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase">{h?.canchas?.nombre}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Activity size={14} className="text-orange-500" />
                                                    <p className="text-[9px] font-black text-slate-600 uppercase">Nivel: {h?.niveles_entrenamiento?.nombre}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} className="text-blue-600" />
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none">{diasSemana[h?.dia_semana]}</p>
                                                        <p className="text-sm font-black italic text-[#1e3a8a] mt-0.5">
                                                            {renderHoraLimpia(h?.hora_inicio)} - {renderHoraLimpia(h?.hora_fin)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 text-center relative overflow-hidden">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 italic">Evidencia de Operación</p>
                        <img src={paymentData?.url_comprobante} alt="Voucher" className="max-h-[600px] mx-auto rounded-[2rem] shadow-2xl border-4 border-white transition-transform hover:scale-[1.01]" />
                        <a href={paymentData?.url_comprobante} target="_blank" rel="noreferrer" className="absolute top-12 right-12 p-3 bg-white/90 backdrop-blur rounded-2xl text-blue-600 shadow-xl hover:bg-[#1e3a8a] hover:text-white transition-all"><ExternalLink size={20}/></a>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setValidationStatus('APROBADO')} className={`py-5 rounded-2xl font-black uppercase text-[10px] border-2 transition-all ${validationStatus === 'APROBADO' ? 'bg-green-600 border-green-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>APROBAR</button>
                            <button onClick={() => setValidationStatus('RECHAZADO')} className={`py-5 rounded-2xl font-black uppercase text-[10px] border-2 transition-all ${validationStatus === 'RECHAZADO' ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>RECHAZAR</button>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Monto Confirmado (S/)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="number" className="w-full bg-slate-50 border-4 border-slate-100 rounded-[1.5rem] pl-12 pr-6 py-4 font-black text-2xl text-[#1e3a8a] outline-none focus:border-blue-200 transition-all" value={montoConfirmado} onChange={(e) => setMontoConfirmado(e.target.value)} />
                            </div>
                        </div>

                        <textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-[11px] font-bold min-h-[120px] resize-none outline-none focus:border-blue-100" placeholder="Escribir notas de validación..." value={notas} onChange={(e) => setNotas(e.target.value)} />
                    </div>

                    {/* ALCANCÍA DINÁMICA */}
                    <div className={`p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden transition-all duration-500 ${infoFinanciera.esPagoCompleto ? 'bg-[#1e3a8a]' : 'bg-orange-600'}`}>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <h4 className="font-black uppercase italic text-xl leading-none">Control de<br/>Alcancía</h4>
                                {infoFinanciera.esPagoCompleto ? <ShieldCheck size={32} className="text-green-400"/> : <AlertCircle size={32} className="text-orange-200 animate-pulse"/>}
                            </div>
                            
                            <div className="space-y-4 text-[11px] font-black uppercase italic opacity-90">
                                <div className="flex justify-between opacity-60"><span>Costo del Ciclo:</span><span>{formatCurrency(infoFinanciera.deudaTotal)}</span></div>
                                
                                {infoFinanciera.otrosPagosAprobados > 0 && (
                                    <div className="flex justify-between text-blue-200 bg-white/5 p-2 rounded-xl border border-white/10">
                                        <span>Ya pagado (abonos):</span>
                                        <span>+ {formatCurrency(infoFinanciera.otrosPagosAprobados)}</span>
                                    </div>
                                )}
                                
                                <div className="flex justify-between text-orange-200 pt-3 border-t border-white/10">
                                    <span>Ingreso de Hoy:</span>
                                    <span>+ {formatCurrency(montoConfirmado)}</span>
                                </div>
                                
                                <div className={`mt-6 p-5 rounded-[2rem] flex flex-col items-center justify-center border-2 border-white/20 ${infoFinanciera.esPagoCompleto ? 'bg-green-500/20' : 'bg-black/20'}`}>
                                    <span className="text-[8px] opacity-60 mb-1">
                                        {infoFinanciera.esPagoCompleto ? '¡DEUDA TOTAL CUBIERTA!' : 'SALDO FINAL PENDIENTE'}
                                    </span>
                                    <span className="text-3xl font-black tracking-tighter">
                                        {formatCurrency(infoFinanciera.saldoRestante)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <DollarSign size={120} className="absolute -right-8 -bottom-8 opacity-5 rotate-12" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPaymentValidation;