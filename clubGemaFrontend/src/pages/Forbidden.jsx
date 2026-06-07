import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Forbidden = () => {
    const { user } = useAuth();

    // Determinar la ruta de retorno basada en el rol del usuario
    const getReturnPath = () => {
        const role = user?.rol || user?.user?.rol;
        switch (role) {
            case 'admin':
                return '/dashboard/admin';
            case 'student':
            case 'alumno':
                return '/dashboard/student';
            case 'teacher':
            case 'profesor':
                return '/dashboard/teacher';
            default:
                return '/';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl p-8 text-center border-t-4 border-red-500">

                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert size={40} className="text-red-500" />
                </div>

                <h1 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter mb-2">
                    Acceso Denegado
                </h1>

                <p className="text-slate-500 mb-8 leading-relaxed font-medium">
                    Oops! No tienes los permisos necesarios para visualizar esta página. Si crees que esto es un error, por favor contacta con soporte.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                    >
                        <ArrowLeft size={18} />
                        <span>Volver atrás</span>
                    </button>

                    <Link
                        to={getReturnPath()}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1e3a8a] text-white font-bold hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/20"
                    >
                        <Home size={18} />
                        <span>Ir al Inicio</span>
                    </Link>
                </div>
            </div>

            <p className="mt-8 text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] opacity-50">
                CLUB GEMA | SEGURIDAD
            </p>
        </div>
    );
};

export default Forbidden;
