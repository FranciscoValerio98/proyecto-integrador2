import React, { useEffect } from 'react';
import StudentRegistration from '../components/StudentRegistration';

/**
 * Page: Register
 * Esta página sirve como contenedor para el proceso de inscripción
 * de nuevos alumnos de la Club Gema.
 */
const Register = () => {

    // Opcional: Desplazar al inicio cuando se carga la página
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="min-h-screen w-full bg-[#263e5e] selection:bg-[#cd5a2c] selection:text-white">
            {/* Renderizamos el componente StudentRegistration que contiene 
                toda la lógica de negocio, validaciones y diseño de la matrícula.
            */}
            <StudentRegistration />

            {/* Footer sutil para la página de registro 
                (Opcional: puedes quitarlo si el componente ya ocupa toda la pantalla)
            */}
            <div className="pb-8 text-center">
                <p className="text-blue-200/40 text-[10px] uppercase font-black tracking-[0.3em]">
                    © 2026 Club Gema • Sistema de Gestión Deportiva
                </p>
            </div>
        </main>
    );
};

export default Register;