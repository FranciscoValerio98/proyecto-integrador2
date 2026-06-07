import React, { useState, useEffect } from 'react';
import { Ticket, UserPlus, CheckCircle, Loader2, AlertTriangle, ShieldCheck, Send, User, Phone, Clock, CreditCard, DollarSign } from 'lucide-react';
import { apiFetch } from '../../interceptors/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminGuestPasses = () => {
  const { userId } = useAuth();
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [creating, setCreating] = useState(false);
  const [guestUser, setGuestUser] = useState(null);

  // Estados para el Formulario de Venta
  const [horarios, setHorarios] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Datos del Visitante (Incluye el Monto Cobrado)
  const [formData, setFormData] = useState({
    nombreVisitante: '',
    telefonoVisitante: '',
    horario_id: '',
    metodo_pago_id: '',
    montoCobrado: ''
  });

  const DNI_COMODIN = "00000000";

  // 1. VERIFICAR COMODÍN Y CARGAR DATOS (Versión Indestructible 🛡️)
  const fetchData = async () => {
    try {
      setLoadingConfig(true);

      // 1. Buscar al Usuario Comodín
      try {
        const resUser = await apiFetch.get(`/usuarios/dni/${DNI_COMODIN}`);
        const userResult = await resUser.json();
        if (resUser.ok && userResult.data) setGuestUser(userResult.data);
      } catch (e) {
        console.error("Error cargando usuario comodín", e);
      }

      // 2. Buscar Horarios Activos
      try {
        const resHorarios = await apiFetch.get('/horarios');
        const horariosResult = await resHorarios.json();
        if (resHorarios.ok && horariosResult.data) {
          setHorarios(horariosResult.data.filter(h => h.activo));
        }
      } catch (e) {
        console.error("Error cargando horarios", e);
      }

      // 3. Buscar Métodos de Pago
      try {
        const resMetodos = await apiFetch.get('/metodos-pago');
        const metodosResult = await resMetodos.json();

        if (resMetodos.ok && metodosResult.data) {
          setMetodosPago(metodosResult.data.filter(m => m.activo));
        } else {
          throw new Error("No hay métodos");
        }
      } catch (e) {
        console.warn("Cargando métodos de pago de respaldo...");
        setMetodosPago([
          { id: 1, nombre: 'Yape' },
          { id: 2, nombre: 'Plin' },
          { id: 3, nombre: 'Efectivo' },
          { id: 4, nombre: 'Transferencia' }
        ]);
      }

    } catch (error) {
      console.error(error);
      toast.error("Error crítico sincronizando el sistema");
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. CREAR EL ALUMNO COMODÍN
  const handleCreateGuest = async () => {
    setCreating(true);
    const payloadInvitado = {
      email: "invitado@gema.com", password: "GemaInvitado2026!", nombres: "Pase", apellidos: "Invitado Gema",
      rol_id: "alumno", tipo_documento_id: "DNI", numero_documento: DNI_COMODIN, telefono_personal: "+51000000000",
      fecha_nacimiento: "2000-01-01", genero: "M",
      datosRolEspecifico: {
        direccion: { direccion_completa: "Sede Club Gema", distrito: "San Martín de Porres" },
        condiciones_medicas: "Ninguna", seguro_medico: "Ninguno", grupo_sanguineo: "O+"
      }
    };

    try {
      const response = await apiFetch.post('/usuarios/register', payloadInvitado);
      if (response.ok) {
        toast.success("¡Comodín creado!", { style: { background: '#10b981', color: '#fff' } });
        await fetchData();
      } else {
        const err = await response.json(); toast.error(err.message);
      }
    } catch (error) { toast.error("Error crítico"); }
    finally { setCreating(false); }
  };

  // 3. PROCESAR LA VENTA EXPRESS
  const handleVentaExpress = async (e) => {
    e.preventDefault();
    if (!guestUser) return toast.error("El sistema no está configurado aún.");

    // Validación extra para evitar montos negativos o en cero
    const montoFinal = parseFloat(formData.montoCobrado);
    if (isNaN(montoFinal) || montoFinal <= 0) {
      return toast.error("Por favor ingresa un monto válido.");
    }

    setSubmitting(true);

    try {
      // Obtenemos el texto del horario seleccionado para guardarlo en la auditoría
      const selectElement = document.getElementById('horarioSelect');
      const horarioTexto = selectElement.options[selectElement.selectedIndex].text;

      // 💰 Llamamos al endpoint de pago directo con el MONTO DINÁMICO
      const resVenta = await apiFetch.post('/pagos/venta-express', {
        alumno_id: guestUser.id,
        adminId: userId,
        monto: montoFinal,
        metodo_pago_id: formData.metodo_pago_id,
        nombre_visitante: formData.nombreVisitante,
        telefono: formData.telefonoVisitante,
        horario_texto: horarioTexto
      });

      const result = await resVenta.json();

      if (!resVenta.ok) throw new Error(result.message || "Error al procesar el pago");

      toast.success(`Pago de S/ ${montoFinal.toFixed(2)} registrado para ${formData.nombreVisitante}`, {
        icon: '💵',
        style: { background: '#10b981', color: '#fff' }
      });

      // Limpiar formulario para el siguiente cliente
      setFormData({ nombreVisitante: '', telefonoVisitante: '', horario_id: '', metodo_pago_id: '', montoCobrado: '' });

    } catch (error) {
      toast.error(error.message || "No se pudo registrar el pago");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in pb-24">

      {/* HEADER */}
      <div className="mb-10 flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] rounded-2xl flex items-center justify-center text-white shadow-xl transform -rotate-3">
          <Ticket size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-black text-[#1e3a8a] uppercase tracking-tighter italic leading-none">
            Taquilla <span className="text-orange-500">Express</span>
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
            Venta rápida de clases sueltas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* COLUMNA 1: ESTADO DEL SISTEMA */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100">
            <h2 className="font-black text-[#1e3a8a] uppercase italic text-sm mb-4">Estado del Comodín</h2>

            {loadingConfig ? (
              <div className="flex items-center gap-2 text-slate-400 font-bold text-xs"><Loader2 className="animate-spin" size={14} /> Cargando...</div>
            ) : !guestUser ? (
              <div className="bg-orange-50 p-4 rounded-2xl text-center border border-orange-200">
                <AlertTriangle size={24} className="mx-auto text-orange-500 mb-2" />
                <p className="text-[10px] font-black text-orange-700 uppercase mb-3">Requiere Configuración</p>
                <button onClick={handleCreateGuest} disabled={creating} className="w-full bg-orange-500 text-white py-2 rounded-xl text-xs font-bold uppercase hover:bg-orange-600 transition-colors">
                  {creating ? 'Creando...' : 'Crear Comodín'}
                </button>
              </div>
            ) : (
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex items-center gap-3">
                <div className="bg-emerald-500 text-white p-2 rounded-xl"><ShieldCheck size={20} /></div>
                <div>
                  <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Sistema Operativo</p>
                  <p className="text-xs font-bold text-emerald-600 mt-0.5">DNI: {DNI_COMODIN}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA 2: FORMULARIO DE VENTA */}
        <div className="lg:col-span-2">
          <div className={`bg-white p-8 rounded-[2.5rem] shadow-2xl border-4 border-white transition-opacity ${!guestUser ? 'opacity-50 grayscale pointer-events-none' : ''}`}>

            <div className="flex items-center justify-between mb-8">
              <h2 className="font-black text-[#1e3a8a] uppercase italic text-2xl">Nuevo Pase</h2>
              <span className="bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                Registro Inmediato
              </span>
            </div>

            <form onSubmit={handleVentaExpress} className="space-y-6">

              {/* Fila 1: Datos Personales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <User size={12} /> Nombre del Visitante
                  </label>
                  <input
                    type="text" required
                    placeholder="Ej. Juan Pérez"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-[#1e3a8a] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all uppercase"
                    value={formData.nombreVisitante}
                    onChange={(e) => setFormData({ ...formData, nombreVisitante: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Phone size={12} /> Teléfono (Opcional)
                  </label>
                  <input
                    type="tel"
                    placeholder="Para enviar promociones"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-[#1e3a8a] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={formData.telefonoVisitante}
                    onChange={(e) => setFormData({ ...formData, telefonoVisitante: e.target.value })}
                  />
                </div>
              </div>

              {/* Fila 2: Selección de Clase (Ocupa todo el ancho) */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Clock size={12} /> Horario de la Clase
                </label>
                <select
                  id="horarioSelect"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-[#1e3a8a] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all uppercase cursor-pointer"
                  value={formData.horario_id}
                  onChange={(e) => setFormData({ ...formData, horario_id: e.target.value })}
                >
                  <option value="">SELECCIONAR DÍA</option>
                  {horarios
                    .reduce((acc, current) => {
                      // 1. Filtramos para que no se repitan los días en la lista
                      const existe = acc.find(item => item.dia_semana === current.dia_semana);

                      // 🔥 CAMBIO AQUÍ: Eliminamos el filtro (<= 6) para permitir el 7 o 0 (Domingo)
                      if (!existe) {
                        acc.push(current);
                      }
                      return acc;
                    }, [])
                    // 2. Ordenamos: Lunes(1) a Sábado(6) y Domingo(7 o 0) al final
                    .sort((a, b) => {
                      const diaA = a.dia_semana === 0 ? 7 : a.dia_semana;
                      const diaB = b.dia_semana === 0 ? 7 : b.dia_semana;
                      return diaA - diaB;
                    })
                    .map(h => {
                      // 🔥 CAMBIO AQUÍ: Agregamos 'DOMINGO' al array de nombres
                      const nombresDias = {
                        1: 'LUNES', 2: 'MARTES', 3: 'MIÉRCOLES',
                        4: 'JUEVES', 5: 'VIERNES', 6: 'SÁBADO',
                        7: 'DOMINGO', 0: 'DOMINGO'
                      };
                      return (
                        <option key={h.id} value={h.id}>
                          {nombresDias[h.dia_semana]}
                        </option>
                      );
                    })
                  }
                </select>
              </div>

              {/* Fila 3: Método de Pago y Monto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <CreditCard size={12} /> Método de Pago
                  </label>
                  <select
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-[#1e3a8a] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all uppercase cursor-pointer"
                    value={formData.metodo_pago_id}
                    onChange={(e) => setFormData({ ...formData, metodo_pago_id: e.target.value })}
                  >
                    <option value="">SELECCIONAR MÉTODO</option>
                    {metodosPago.map(m => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <DollarSign size={12} /> Monto a Cobrar (S/)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ej. 25.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black text-orange-600 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-bold"
                    value={formData.montoCobrado}
                    onChange={(e) => setFormData({ ...formData, montoCobrado: e.target.value })}
                  />
                </div>
              </div>

              {/* Botón de Envío */}
              <button
                type="submit"
                disabled={submitting || !guestUser}
                className="w-full bg-[#1e3a8a] hover:bg-[#0f172a] text-white py-5 rounded-2xl font-black uppercase italic tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-xl hover:shadow-blue-900/30 group mt-4"
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="group-hover:translate-x-1 transition-transform" />}
                Registrar Venta Express
              </button>

            </form>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminGuestPasses;