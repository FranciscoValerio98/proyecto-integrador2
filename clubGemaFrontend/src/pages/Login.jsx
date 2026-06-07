import React, { useEffect, useState } from 'react';
import { loginService } from '../services/auth.service';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  useEffect(() => {
    const prefillUsername = location.state?.prefillUsername;
    if (prefillUsername) {
      setIdentifier(prefillUsername);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Verificando credenciales...');
    try {
      const data = await loginService(identifier, password);
      if (!data || !data.user) throw new Error("Respuesta del servidor incompleta");
      login(data);
      const { rol, nombres, debeCompletarEmail } = data.user;
      toast.success(`¡Bienvenido, ${nombres}!`, { id: toastId });
      const routes = {
        'Administrador': '/dashboard/admin/payment-validation',
        'Coordinador': '/dashboard/teacher',
        'Alumno': '/dashboard/student'
      };
      const targetRoute = routes[rol] || '/login';
      navigate(targetRoute);
    } catch (error) {
      const serverMessage = error?.message || "Error de conexión";
      const cleanMessage = serverMessage.replace(/\x1B\[[0-9;]*m/g, "");
      toast.error(cleanMessage, {
        id: toastId,
        style: {
          border: '1px solid #fee2e2',
          padding: '16px',
          color: '#991b1b',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          fontSize: '12px',
          letterSpacing: '0.1em',
          borderRadius: '16px',
          background: '#fff',
        },
        iconTheme: { primary: '#f97316', secondary: '#fff' },
      });
    }
  };

  return (
    // h-[100dvh] asegura que ocupe el alto real del móvil restando las barras del navegador
    <div className="h-[100dvh] w-full flex items-center justify-center p-2 md:p-8 font-sans relative overflow-hidden">

      {/* FONDO */}
      <div className="absolute inset-0 z-0">
        <img src="/bg.jpg" alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm"></div>
      </div>

      {/* BOTÓN VOLVER */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-3 left-3 md:top-8 md:left-8 flex items-center gap-2 px-3 py-1.5 md:px-5 md:py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-xl z-50 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]"
      >
        <ArrowLeft size={14} className="text-orange-500" />
        <span className="hidden xs:inline">Volver al inicio</span>
        <span className="xs:hidden">Volver</span>
      </button>

      {/* TARJETA PRINCIPAL - max-h-full y flex-col permite que se ajuste al alto del dispositivo */}
      <div className="relative z-10 w-full max-w-4xl max-h-full md:max-h-[90vh] bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/10">

        {/* LADO IZQUIERDO: Branding - Reducido en móvil para dar espacio al form */}
        <div className="w-full md:w-1/2 bg-gradient-to-b from-blue-600 via-blue-800 to-indigo-950 p-6 md:p-10 text-white flex flex-col justify-between relative min-h-[140px] md:min-h-[500px]">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-white rounded-full"></div>
          </div>

          <div className="z-10 flex flex-col items-center text-center mt-2 md:mt-10">
            <img
              src="/logo_diamante.jpeg"
              alt="Logo Club Gema"
              className="w-20 md:w-72 h-auto rounded-full filter drop-shadow-lg"
            />
          </div>

          <div className="z-10 flex flex-col items-center mt-2">
            <div className="bg-transparent border border-orange-500/40 backdrop-blur-md px-3 py-2 md:px-6 md:py-4 rounded-xl w-full max-w-sm text-center">
              <div className="text-[10px] md:text-sm font-bold text-blue-200">Ecosistema Deportivo Digital</div>
              <div className="text-[7px] md:text-[9px] text-blue-400 uppercase tracking-widest font-black hidden md:block">
                Constancia · Disciplina · Comunidad
              </div>
            </div>
          </div>
        </div>

        {/* LADO DERECHO: Formulario - overflow-y-auto es la clave aquí */}
        <div className="w-full md:w-1/2 p-6 md:p-14 flex flex-col bg-white overflow-y-auto scrollbar-hide">
          <div className="mb-6 md:mb-10 text-center md:text-left">
            <h3 className="text-2xl md:text-4xl font-black text-[#1e3a8a] tracking-tighter uppercase italic">
              Bienvenido
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Usuario"
              className="w-full px-4 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl text-slate-700 focus:border-orange-500 text-sm md:text-base outline-none transition-all"
            />

            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  className="w-full px-4 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl text-slate-700 focus:border-orange-500 pr-12 text-sm md:text-base outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex items-start gap-2 px-1">
                <AlertCircle size={12} className="text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="text-[10px] text-slate-400 leading-tight italic font-medium">
                  Ingresa la contraseña de tu registro web.
                  <span className="block text-slate-500 not-italic mt-0.5">
                    Nota: Si no te registraste, tu contraseña es tu usuario.
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3.5 md:py-4 rounded-xl shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all text-xs md:text-sm uppercase tracking-widest"
            >
              Iniciar Sesión
            </button>

            <div className="text-center">
              <Link to="/forgot-password" title="Recuperar" className="text-[10px] md:text-xs font-bold text-slate-400 hover:text-orange-500">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>

          {/* SECCIÓN INFERIOR COMPLETA */}
          <div className="mt-6 md:mt-12 pt-6 border-t border-slate-100 text-center flex flex-col items-center gap-4">
            <Link to="/register" className="text-orange-500 font-black hover:text-orange-600 inline-flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-widest">
              Comienza tu inscripción hoy <span>→</span>
            </Link>

            <span className="text-[8px] md:text-[9px] text-slate-400 block font-bold uppercase tracking-tight">
              Al registrarte aceptas nuestros Términos y Condiciones
            </span>
          </div>

          <p className="mt-6 md:mt-12 text-center text-[9px] md:text-[10px] text-slate-300 font-black uppercase tracking-[0.3em] pb-4">
            Club Gema | Desde 2023
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
