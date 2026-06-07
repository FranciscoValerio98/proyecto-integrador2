import React, { useState, useEffect } from 'react';
import { Mail, Phone, Edit2, ArrowLeft, Shield, KeyRound, Loader2, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import apiFetch from '../../interceptors/api.js';
import { API_ROUTES } from '../../constants/apiRoutes.js';
import ChangePasswordModal from '../../components/shared/ChangePasswordModal.jsx';
import EditTeacherProfileModal from '../../components/teacher/EditTeacherProfileModal.jsx';

const TeacherProfile = () => {
  const { updateUserData, user: authUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await apiFetch.get(API_ROUTES.COORDINADORES.BY_ID(authUser.user.id));
      const result = await response.json();
      if (response.ok) setProfileData(result.data);
    } catch (error) {
      console.error("Error cargando perfil del coordinador:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="animate-spin text-orange-500" size={40} />
    </div>
  );

  // El endpoint AUTH.USER devuelve directo los datos del usuario logueado en data.user o data
  const user = profileData?.user || profileData || {};
  const coordinadorData = user.coordinadores || {};

  const coordinatorFullName = authUser?.user ? `${authUser.user.nombres} ${authUser.user.apellidos}` : 'Coordinador Gema';
  const userInitial = authUser?.user?.nombres?.charAt(0).toUpperCase() || 'G';

  const handleProfileUpdate = (newData) => {
    fetchProfile();
    if (updateUserData) updateUserData(newData);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-10 animate-fade-in pb-32">
      {/* Navegación Superior */}
      <div className="flex justify-between items-center mb-6">
        <Link to="/dashboard/teacher" className="flex items-center gap-2 text-slate-400 hover:text-[#1e3a8a] transition-all group">
          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 group-hover:border-orange-200">
            <ArrowLeft size={16} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest italic">Volver al Panel</span>
        </Link>
      </div>

      {/* Hero Card Premium */}
      <div className="relative mb-8 md:mb-12">
        <div className="bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] rounded-[2rem] md:rounded-[3.5rem] p-6 sm:p-8 md:p-12 text-white shadow-2xl relative overflow-hidden border border-white/5">
          <img src="/logo.png" className="absolute -right-10 -bottom-10 md:-right-20 md:-bottom-20 w-64 md:w-80 opacity-[0.05] rotate-12 pointer-events-none" alt="" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 relative z-10">
            <div className="relative shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-[2rem] md:rounded-[3rem] bg-white p-1 shadow-2xl transform rotate-3">
                <div className="w-full h-full rounded-[1.7rem] sm:rounded-[2.2rem] md:rounded-[2.8rem] bg-slate-100 flex items-center justify-center text-5xl md:text-6xl font-black text-[#1e3a8a] italic">
                  {userInitial}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-orange-500 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-xl border-4 border-[#1e3a8a]">
                <Shield size={18} className="sm:w-[20px] sm:h-[20px]" fill="white" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left w-full">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                <div className="space-y-2">
                  <p className="text-orange-500 font-black uppercase tracking-[0.4em] text-[10px] italic">Perfil Administrativo Gema</p>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black uppercase italic tracking-tighter leading-tight break-words">
                    {coordinatorFullName}
                  </h1>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 mt-3 sm:mt-4">
                    <span className="text-[10px] font-bold px-5 py-2 rounded-full uppercase tracking-widest bg-orange-500 shadow-lg shadow-orange-500/20">
                      Coordinador Oficial
                    </span>
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-2 md:mt-0">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex-1 flex items-center justify-center gap-3 bg-orange-500 hover:bg-white hover:text-orange-500 text-white px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl transition-all duration-300 shadow-xl active:scale-95 font-black text-[10px] sm:text-xs uppercase tracking-widest border-2 border-transparent hover:border-orange-500 w-full"
                  >
                    <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span>Editar Datos</span>
                  </button>
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="flex-1 flex items-center justify-center gap-3 bg-white/10 hover:bg-white text-white hover:text-[#1e3a8a] px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl transition-all duration-300 active:scale-95 font-black text-[10px] sm:text-xs uppercase tracking-widest border-2 border-white/20 hover:border-white w-full"
                  >
                    <KeyRound size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span>Contraseña</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Datos: Diseño Horizontal y Robusto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

        {/* Columna Izquierda: Contacto */}
        <section className="space-y-6">
          <SectionHeader icon={<User size={16} />} title="Información Personal" />
          <InfoCard icon={<Mail />} label="Email Asociado" value={user.email} color="blue" />
          <InfoCard icon={<Phone />} label="Celular / WhatsApp" value={user.telefono_personal} color="orange" />
        </section>

        {/* Columna Derecha: Datos Profesionales */}
        <section className="space-y-6">
          <SectionHeader icon={<Shield size={16} />} title="Datos Profesionales" />
          <InfoCard
            icon={<User />}
            label="Especialización"
            value={coordinadorData.especializacion || 'Por definir'}
            color="blue"
          />
        </section>
      </div>

      <EditTeacherProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUser={user} // Pasamos el objeto completo para pre-llenar
        onSuccess={handleProfileUpdate}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

/* --- Componentes UI Atómicos --- */

const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center gap-3 px-6 mb-2">
    <div className="text-orange-500">{icon}</div>
    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] italic">{title}</h3>
  </div>
);

const InfoCard = ({ icon, label, value, color }) => {
  const styles = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white p-5 sm:p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 group transition-all duration-300">
      <div className="flex items-center sm:items-start gap-4 sm:gap-6">
        <div className={`shrink-0 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl transition-all group-hover:bg-orange-500 group-hover:text-white ${styles[color]}`}>
          {React.cloneElement(icon, { size: 20, className: 'sm:w-[22px] sm:h-[22px]', strokeWidth: 2.5 })}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5 sm:mb-1 italic">{label}</p>
          <p className="font-black text-[#1e3a8a] tracking-tight break-words text-xs sm:text-sm">
            {value || 'Pendiente de registro'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
