import { pagosService } from './pagos.service.js';
import { catchAsync } from '../../shared/utils/catchAsync.util.js';
import { apiResponse } from '../../shared/utils/response.util.js';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { prisma } from '../../config/database.config.js';// Ajusta la ruta si es necesario
import { mercadoPagoService } from './mercado-pago.service.js';
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });

export const pagosController = {
  // 1. REPORTAR PAGO (Con soporte para subida de imagen a Cloudinary)
  reportarPago: async (req, res) => {
    try {
      console.log('📝 [DEBUG] Datos recibidos en reportarPago:', req.body);
      console.log('📁 [DEBUG] Archivo recibido:', req.file ? req.file.originalname : 'Ninguno');

      // Pasar tanto los datos del body como el archivo (si existe)
      const resultado = await pagosService.registrarPago({
        ...req.body,
        voucherFile: req.file, // El archivo subido desde el frontend
      });

      res.status(201).json({
        status: 'success',
        message: '¡Pago reportado! Tus cupos están en validación por el administrador.',
        data: resultado,
      });
    } catch (error) {
      console.error('❌ [ERROR AL REPORTAR PAGO]:', error.message);
      // Diferenciamos errores de "no encontrado" vs errores de lógica
      const statusCode = error.message.includes('no existe') ? 404 : 400;

      res.status(statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
  },
  // =================================================================
  // 🎟️ NUEVO: VENTA EXPRESS (Taquilla)
  // =================================================================
  registrarVentaExpress: catchAsync(async (req, res) => {
    // Tomamos el ID del admin desde el token (si usas middleware authenticate)
    // O si lo mandas desde el body, lo tomamos de ahí. (Por defecto 1 como salvavidas)
    const adminId = req.user?.id || req.body.adminId || 1; 

    const resultado = await pagosService.registrarVentaExpress(req.body, adminId);

    return apiResponse.success(res, {
      message: resultado.mensaje,
      data: resultado,
    });
  }),

  // 2. VALIDAR PAGO (Actualizado con "La Verdad del Admin" 👮‍♂️)
  validarPagoAdmin: async (req, res) => {
    try {
      // Recibimos los datos del Body.
      // 🆕 AGREGADO: 'monto_real_confirmado' por si el Admin necesita corregir.
      const { pago_id, accion, notas, usuario_admin_id, monto_real_confirmado } = req.body;

      if (!usuario_admin_id) {
        throw new Error('Se requiere el ID del administrador (usuario_admin_id).');
      }

      // Preparamos el objeto completo para el servicio
      const data = {
        pago_id,
        accion,
        notas,
        usuario_admin_id,
        monto_real_confirmado, // <--- Aquí pasamos el dato nuevo
      };

      const resultado = await pagosService.validarPago(data);

      res.status(200).json({
        status: 'success',
        message: resultado.resultado,
        data: resultado,
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message,
      });
    }
  },
  // 3. LISTAR PAGOS
  listarPagos: async (req, res) => {
    try {
      const pagos = await pagosService.obtenerTodos();
      res.status(200).json({ status: 'success', data: pagos });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },

  // 4. OBTENER UN PAGO
  obtenerPago: async (req, res) => {
    try {
      const pago = await pagosService.obtenerPorId(req.params.id);
      res.status(200).json({ status: 'success', data: pago });
    } catch (error) {
      res.status(404).json({ status: 'error', message: error.message });
    }
  },

  obtenerPagosPorAlumno: async (req, res) => {
    try {
      const { alumno_id } = req.params;

      if (!alumno_id) {
        throw new Error('Se requiere el ID del alumno.');
      }

      const pagos = await pagosService.obtenerPorAlumno(alumno_id);

      res.status(200).json({
        status: 'success',
        data: pagos,
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message,
      });
    }
  },
  listarPagosAdmin: async (req, res) => {
    try {
      // Llamada al nuevo método del service
      const pagos = await pagosService.obtenerTodosParaAdmin();
      
      res.status(200).json({ 
        status: 'success', 
        data: pagos 
      });
    } catch (error) {
      console.error('❌ [ERROR LISTAR PAGOS ADMIN]:', error.message);
      res.status(500).json({ 
        status: 'error', 
        message: 'Error al recuperar el listado administrativo.' 
      });
    }
  },

  // 5. ELIMINAR PAGO
  eliminarPago: async (req, res) => {
    try {
      await pagosService.eliminarPago(req.params.id);
      res.status(200).json({ status: 'success', message: 'Registro de pago eliminado.' });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  },
  obtenerDetalle: async (req, res) => {
    try {
      const { id } = req.params;
      const detalle = await pagosService.obtenerDetalleCompleto(id);
      
      res.status(200).json({
        status: 'success',
        data: detalle
      });
    } catch (error) {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
  },
 generarLinkMP: async (req, res) => {
  try {
    const { deuda_id, monto } = req.body;
    
    // 1. Buscamos la deuda en la base de datos
    const deuda = await prisma.cuentas_por_cobrar.findUnique({ 
      where: { id: parseInt(deuda_id) } 
    });

    if (!deuda) {
      return res.status(404).json({ status: 'error', message: 'Deuda no encontrada' });
    }

    // 2. Definimos URLs seguras (con fallback por si el .env falla)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

    // 3. Configuramos la preferencia
    const preference = new Preference(client);
    
    const result = await preference.create({
      body: {
        items: [
          {
            id: deuda.id.toString(),
            title: `Club Gema - Pago de mensualidad`,
            quantity: 1,
            unit_price: Number(monto || deuda.monto_final),
            currency_id: 'PEN',
          }
        ],
        back_urls: {
          success: `${frontendUrl}/student/enrollment?status=approved`,
          failure: `${frontendUrl}/student/enrollment?status=failure`,
          pending: `${frontendUrl}/student/enrollment?status=pending`,
        },
        // Comentamos auto_return para evitar problemas de validación de cuenta
        // auto_return: 'approved', 
        notification_url: `${backendUrl}/api/pagos/webhook-mp`,
        external_reference: deuda.id.toString(),
      }
    });

    // 4. Seleccionamos el link: Sandbox si es entorno de prueba, init_point normal si no
    // Como tu token empieza con APP_USR-... pero estás en desarrollo, 
  // 4. Forzamos el uso de init_point porque los tokens APP_USR chocan con sandbox
    const linkDePago = result.init_point;

    console.log("✅ [DEBUG MP] Link generado:", linkDePago);

    res.status(200).json({
      status: 'success',
      init_point: linkDePago
    });

  } catch (error) {
    console.error('❌ [ERROR MP GENERAR LINK]:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al generar link de pago',
      details: error.message 
    });
  }
},

  // 🔴 Endpoint para el Webhook (Refactorizado)
  webhookMP: async (req, res) => {
    try {
      const { query } = req;
      const topic = query.topic || query.type;

      if (topic === 'payment') {
        const paymentId = query['data.id'] || query.id;
        
        // Llamamos al SERVICIO para que consulte a MP y actualice la BD
        const resultado = await mercadoPagoService.verificarYActualizarPago(paymentId);
        
        if (resultado.success) {
          console.log(`✅ [WEBHOOK MP] Pago ${paymentId} procesado con éxito para deuda ${resultado.deuda_id}`);
        }
      }
      
      // Siempre debemos responder 200 rápido a Mercado Pago
      res.status(200).send('OK');
    } catch (error) {
      console.error('❌ [ERROR WEBHOOK MP]:', error);
      res.status(500).send('Error');
    }
  },
};
