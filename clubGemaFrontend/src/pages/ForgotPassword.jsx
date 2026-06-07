import { useState } from 'react';
import apiFetch from '../interceptors/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { API_ROUTES } from '../constants/apiRoutes';

export const ForgotPassword = () => {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await apiFetch.post(API_ROUTES.AUTH.FORGOT_PASSWORD, { username });

            if (response.ok) {
                toast.success("Si el usuario existe y tiene un correo, se ha enviado un enlace.");
                setUsername('');
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || "Error al solicitar recuperación");
            }
        } catch (error) {
            toast.error("Error de conexión con el servidor");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        /* Fondo Oscuro con degradado radial sutil */
        <div className="min-h-screen flex items-center justify-center bg-[#0a192f] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#112240] via-[#0a192f] to-[#020c1b] px-4">
            <div className="max-w-md w-full">

                {/* Card Principal */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10">

                    {/* Encabezado con Degradado Estilo Club Gema */}
                    <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-10 text-center relative overflow-hidden">
                        {/* Círculos decorativos de fondo */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full"></div>
                        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-orange-500/10 rounded-full"></div>

                        <h1 className="text-3xl font-black text-white tracking-tight uppercase italic relative z-10">
                            GEMA<span className="text-orange-500 not-italic">CLUB</span>
                        </h1>
                        <div className="h-1.5 w-14 bg-orange-500 mx-auto mt-3 rounded-full relative z-10"></div>
                        <p className="text-blue-100 mt-5 text-sm font-semibold tracking-wide relative z-10 uppercase">
                            Recuperación de Cuenta
                        </p>
                    </div>

                    <div className="p-10">
                        <p className="text-slate-500 text-center mb-10 text-sm leading-relaxed font-medium">
                            Ingresa tu <span className="text-blue-900 font-bold italic">nombre de usuario</span> para recibir el enlace de restauración en tu correo vinculado.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-7">
                            <div className="group">
                                <label className="block text-[0.7rem] font-black text-slate-400 uppercase tracking-[0.15em] mb-2.5 ml-1 group-focus-within:text-blue-600 transition-colors">
                                    Nombre de Usuario
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Ej: usuario.gema"
                                        className="w-full pl-5 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-0 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 text-slate-700 font-medium"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl transition-all shadow-[0_10px_20px_-5px_rgba(249,115,22,0.4)] active:scale-[0.97] uppercase tracking-widest text-sm ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Procesando...
                                    </span>
                                ) : (
                                    'Enviar Instrucciones'
                                )}
                            </button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
                            <Link
                                to="/login"
                                className="text-slate-400 hover:text-blue-900 font-bold text-xs transition-all uppercase tracking-widest flex items-center justify-center gap-2 group"
                            >
                                <span className="group-hover:-translate-x-1 transition-transform">←</span> Volver al Login
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer Decorativo con texto más claro para fondo oscuro */}
                <p className="text-center text-slate-500 text-[10px] mt-10 font-bold uppercase tracking-[0.2em] opacity-60">
                    Club Gema © 2026 · Sports Management System
                </p>
            </div>
        </div>
    );
};