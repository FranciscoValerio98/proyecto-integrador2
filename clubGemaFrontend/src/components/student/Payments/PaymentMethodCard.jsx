import React from 'react';
import { Copy, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentMethodCard = ({ phoneNumber = "902585995", owner = "Club Gema S.A.C." }) => {
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(phoneNumber);
    toast.success('Número copiado al portapapeles', {
      style: { borderRadius: '15px', background: '#1e3a8a', color: '#fff', fontSize: '12px' }
    });
  };

  return (
    <div className="bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] text-white rounded-[3rem] p-8 mb-12 shadow-2xl relative overflow-hidden border border-white/10">
      {/* Logo de fondo decorativo */}
      <div className="absolute -bottom-10 -right-10 opacity-10 pointer-events-none">
        <img src="/logo.png" alt="" className="w-64 h-auto rotate-12" />
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
        {/* ✅ CONTENEDOR CON TU QR REAL */}
        <div className="bg-white p-3 rounded-[2.5rem] shadow-2xl transform hover:rotate-2 transition-transform duration-500 group relative">
          <div className="overflow-hidden rounded-[2rem]">
            <img 
              src="/QrYapeGema.PNG" 
              alt="QR Oficial Club Gema" 
              className="w-40 h-40 object-cover group-hover:scale-110 transition-transform duration-500" 
            />
          </div>
          <div className="mt-3 text-center">
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mb-1">
              QR Oficial Gema
            </p>
            <div className="bg-blue-50 py-1 px-2 rounded-full inline-block">
              <span className="text-[6px] font-black text-[#1e3a8a] uppercase italic">Yape / Plin</span>
            </div>
          </div>
        </div>

        {/* Info de Pago */}
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-orange-500 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 shadow-lg shadow-orange-500/30">
            <ShieldCheck size={14} /> Recaudación Segura
          </div>
          
          <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-2 leading-none">
            Pago con <span className="text-orange-500">QR</span>
          </h3>
          <p className="text-sm text-blue-100/60 mb-6 font-medium italic max-w-sm">
            Escanea el código o usa el número para realizar tu pago. Recuerda reportar el voucher para validar tu acceso.
          </p>

          <div className="inline-flex items-center gap-6 bg-white/5 backdrop-blur-xl p-5 rounded-[2rem] border border-white/10 group hover:bg-white/10 transition-all">
            <div className="text-left">
              <span className="text-[9px] font-black text-orange-400 uppercase tracking-[0.2em]">Número de Contacto</span>
              <p className="text-3xl font-black tracking-widest text-white italic leading-none mt-1">
                {phoneNumber.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')}
              </p>
            </div>
            <button
              onClick={copyToClipboard}
              type="button"
              className="p-4 bg-white/10 hover:bg-orange-500 rounded-2xl transition-all duration-300 shadow-lg group-hover:scale-110"
              title="Copiar Número"
            >
              <Copy size={22} />
            </button>
          </div>
          
          <p className="text-[10px] mt-4 font-black text-blue-200/30 uppercase tracking-[0.4em] italic">
            Titular: {owner}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodCard;