import { Users, GraduationCap, DollarSign, MapPin, AlertCircle, TrendingUp, BookOpen, Award, Calendar } from 'lucide-react';

export const roleData = {
    admin: {
        stats: [
            { id: "alumnos", title: "Alumnos Activos", value: "0", icon: Users, color: "blue" },
            { id: "coordinadores", title: "Cuerpo Técnico", value: "0", icon: GraduationCap, color: "orange" },
            { id: "sedes", title: "Sedes Gema", value: "0", icon: MapPin, color: "purple" },
            { id: "pendientes", title: "Deudas Pendientes", value: "$0.00", icon: AlertCircle, color: "gray" },
        ],
        recentTitle: "Movimientos del Club",
        activity: [
            { id: 1, text: "Nueva inscripción detectada", date: "Hoy" },
            { id: 2, text: "Pago validado por Administración", date: "Ayer" },
        ]
    },
    teacher: {
        title: "Portal del Entrenador",
        stats: [
            { title: "Mis Clases Hoy", value: "4", icon: BookOpen, color: "blue" },
            { title: "Alumnos a Cargo", value: "45", icon: Users, color: "orange" },
            { title: "Próximo Torneo", value: "12 Oct", icon: Award, color: "purple" },
        ],
        recentTitle: "Próximas Clases",
        activity: [
            { id: 1, text: "08:00 AM - Fundamentos Sub-16 (Cancha 1)", date: "En 30 min" },
            { id: 2, text: "10:00 AM - Selección Mayores (Gimnasio)", date: "Hoy" },
            { id: 3, text: "Revisión de asistencia pendiente", date: "Ayer" },
        ]
    },
    student: {
        title: "Mi Perfil de Alumno",
        stats: [
            { title: "Clases Asistidas", value: "24", icon: Calendar, color: "green" },
            { title: "Nivel Actual", value: "Intermedio", icon: Award, color: "blue" },
            { title: "Pagos Pendientes", value: "$0", icon: DollarSign, color: "gray" },
        ],
        recentTitle: "Mi Agenda",
        activity: [
            { id: 1, text: "Hoy 16:00 - Entrenamiento Técnico", date: "Confirmado" },
            { id: 2, text: "Mañana 09:00 - Partido Amistoso", date: "Pendiente" },
            { id: 3, text: "Pago de mensualidad Noviembre", date: "Completado" },
        ]
    }
};