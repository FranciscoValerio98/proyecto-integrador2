import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { Toaster } from "react-hot-toast";

// 1. Páginas Públicas
import Home from "./pages/Home";
import About from "./pages/About";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from "./pages/ResetPassword";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Forbidden from "./pages/Forbidden";
import ProtectedRoute from "./components/ProtectedRoute";

// 2. Layouts (Contenedores)
import DashboardLayout from "./layouts/DashboardLayout"; // Admin (Sidebar Completo)
import StudentLayout from "./layouts/StudentLayout"; // Estudiante (Móvil + PC Sidebar)
import TeacherLayout from "./layouts/TeacherLayout"; // Coordinador (Sidebar Minimalista)

// 3. Páginas del Dashboard Generales
import Dashboard from "./pages/Dashboard"; // Admin: Resumen General
import DashboardEstudiante from "./pages/DashboardEstudiante"; // Estudiante: Inicio
import DashboardTeacher from "./pages/DashboardTeacher"; // Coordinador: Asistencia
import TeacherProfile from "./pages/teacher/Profile"; // Coordinador: Perfil
import DiaCorte from "./pages/teacher/DiaCorte"

// 4. Nuevas Páginas de Gestión (Admin)
import AdminLocationsManager from "./pages/admin/AdminLocationsManager";
import AdminLevelsManager from "./pages/admin/AdminLevelsManager";
import AdminTeachersManager from "./pages/admin/AdminTeachersManager";
import AdminCatalogManager from "./pages/admin/AdminCatalogManager";
import AdminSchedulesManager from "./pages/admin/AdminScheduleManager";
import AdminStudentsManager from "./pages/admin/AdminStudentManager";
import AdminPaymentManager from "./pages/admin/AdminPaymentManager";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminInjuriesManager from "./pages/admin/AdminInjuriesManager";
import AdminBenefits from "./pages/admin/AdminBenefits";
import AdminCreateBenefits from "./pages/admin/AdminCreateBenefits";
import AdminPublications from "./pages/admin/AdminPublications";
import AdminGuestPasses from "./pages/admin/AdminGuestPasses";
import AdminReprogramaciones from "./pages/admin/AdminReprogramaciones";
import AdminDeleteMakeups from "./pages/admin/AdminDeleteMakeups";
import AdminCreateBenefitsAnuncio from "./pages/admin/AdminCreateBenefitsAnuncio";
// 5. Nuevas Páginas de Estudiante
import Payments from "./pages/student/Payments";
import Profile from "./pages/student/Profile";
import Enrollment from "./pages/student/enrollment";
import Blog from "./pages/Blog";
import StudentInjuries from "./pages/student/StudentInjuries";
import StudentRecoveries from "./pages/student/StudentRecoveries";
import StudentNews from "./pages/student/StudentNews";
import MyRegistrations from "./pages/student/MyRegistrations";


function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          className: '',
          style: {
            border: '2px solid #1e3a8a',
            padding: '16px',
            color: '#1e3a8a',
            borderRadius: '1rem',
            fontWeight: '900',
            fontStyle: 'italic',
            textTransform: 'uppercase',
            boxShadow: '0 10px 15px -3px rgba(30, 58, 138, 0.2), 0 4px 6px -2px rgba(30, 58, 138, 0.1)'
          },
          success: {
            style: {
              background: '#f8fafc',
              borderLeft: '6px solid #1e3a8a', // Blue representing Gema successful operations
            },
            iconTheme: {
              primary: '#1e3a8a',
              secondary: '#fff',
            },
          },
          error: {
            style: {
              background: '#fff',
              borderLeft: '6px solid #f97316', // Orange indicating errors
              color: '#f97316',
              borderColor: '#f97316'
            },
            iconTheme: {
              primary: '#f97316',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        <Route
          path="/*"
          element={
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forbidden" element={<Forbidden />} />

        {/* --- RUTAS PROTEGIDAS (DASHBOARD) --- */}
        <Route path="/dashboard">

          {/* GRUPO 1: ESTUDIANTE (Layout Móvil + Sidebar PC) */}
          <Route element={<ProtectedRoute allowedRoles={['Alumno', 'student', 'alumno']} />}>
            <Route element={<StudentLayout />}>
              <Route path="student" element={<DashboardEstudiante />} />
              <Route path="student/myRegistrations" element={<MyRegistrations />} />
              <Route path="student/payments" element={<Payments />} />
              <Route path="student/profile" element={<Profile />} />
              <Route path="student/enrollment" element={<Enrollment />} />
              <Route path="student/injuries" element={<StudentInjuries />} />
              <Route path="student/recoveries" element={<StudentRecoveries />} />
              <Route path="student/news" element={<StudentNews />} />
              <Route index element={<Navigate to="/dashboard/student" replace />} />
            </Route>
          </Route>

          {/* GRUPO 2: COORDINADOR (Layout Minimalista) */}
          <Route element={<ProtectedRoute allowedRoles={['Coordinador', 'teacher', 'profesor']} />}>
            <Route element={<TeacherLayout />}>
              <Route path="teacher" element={<DashboardTeacher />} />
              <Route path="teacher/profile" element={<TeacherProfile />} />
              <Route path="teacher/DiaCorte" element={<DiaCorte />} />
            </Route>
          </Route>

          {/* GRUPO 3: ADMINISTRADOR (Layout Completo de Gestión) */}
          <Route element={<ProtectedRoute allowedRoles={['Administrador', 'admin', 'administrador']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="admin" element={<Dashboard role="admin" />} />

              {/* Gestión CRUD */}
              <Route path="admin/students" element={<AdminStudentsManager />} />
              <Route path="admin/teachers" element={<AdminTeachersManager />} />
              <Route path="admin/delete-makeups" element={<AdminDeleteMakeups />} />
              <Route path="admin/benefits" element={<AdminBenefits />} />
              <Route path="admin/CreateBenefits" element={<AdminCreateBenefits />} />
              <Route path="admin/schedule" element={<AdminSchedulesManager />} />
              <Route path="admin/reprogramaciones" element={<AdminReprogramaciones />} />
              <Route path="admin/levels" element={<AdminLevelsManager />} />
              <Route path="admin/catalog" element={<AdminCatalogManager />} />
              <Route path="admin/locations" element={<AdminLocationsManager />} />
              <Route path="admin/injuries" element={<AdminInjuriesManager />} />
              <Route path="admin/publications" element={<AdminPublications />} />
              <Route path="admin/anuncios-beneficios" element={<AdminCreateBenefitsAnuncio />} />
              <Route path="admin/payment-validation" element={<AdminPaymentManager />} />
              <Route path="admin/guest-passes" element={<AdminGuestPasses />} />

              {/* Configuración */}
              <Route path="admin/settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
