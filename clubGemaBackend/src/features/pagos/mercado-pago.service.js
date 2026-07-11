import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { prisma } from '../../config/database.config.js'; // Ajusta la ruta a tu prisma

// Inicializar Mercado Pago con el token del .env
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });

export const mercadoPagoService = {
  
  // Función 1: Crea el link de pago
  crearPreferencia: async (deuda, monto) => {
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
          success: `${process.env.FRONTEND_URL}/student/enrollment?status=approved`,
          failure: `${process.env.FRONTEND_URL}/student/enrollment?status=failure`,
          pending: `${process.env.FRONTEND_URL}/student/enrollment?status=pending`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.BACKEND_URL}/api/pagos/webhook-mp`,
        external_reference: deuda.id.toString(),
      }
    });

    return result.init_point;
  },

  // Función 2: Verifica el pago cuando el Webhook avisa y actualiza la BD
  verificarYActualizarPago: async (paymentId) => {
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    if (paymentData.status === 'approved') {
      const deuda_id = paymentData.external_reference;
      
      // 🚩 ACTUALIZAMOS LA BASE DE DATOS
      await prisma.cuentas_por_cobrar.update({
        where: { id: parseInt(deuda_id) },
        data: { 
            estado: 'POR_VALIDAR', // O el estado que manejes
            actualizado_en: new Date() 
        }
      });

      return { success: true, deuda_id };
    }

    return { success: false, status: paymentData.status };
  }
};