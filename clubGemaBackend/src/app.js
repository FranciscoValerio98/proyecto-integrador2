import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { logger } from './shared/utils/logger.util.js';

import { CORS_CREDENTIALS, CORS_ORIGIN } from './config/secret.config.js';
import { errorHandler } from './shared/middlewares/error.middleware.js';

import healthRoutes from './features/health/health.routes.js';
import horarioRoutes from './features/horarios/horario.routes.js';
import usuarioRoutes from './features/usuarios/usuario.routes.js';
import authRoutes from './features/auth/auth.routes.js';
import rolesRoutes from './features/roles/roles.routes.js';
import inscripcionRoutes from './features/inscripciones/inscripcion.routes.js';
import pagosRoutes from './features/pagos/pagos.routes.js';
import sedeRoutes from './features/sedes/sede.routes.js';
import canchasRoutes from './features/canchas/cancha.routes.js';
import nivelesRoutes from './features/niveles/niveles.routes.js';
import asistenciaRoutes from './features/asistencia/asistencia.routes.js';
import cuentaPorCobrarRoutes from './features/cuenta_por_cobrar/cuentas_por_cobrar.routes.js';
import claseRoutes from './features/clases/clase.routes.js';
import catalogoRoutes from './features/catalogo_de_concepto/catalogo.routes.js';
import cloudinaryRoutes from './features/cloudinaryImg/cloudinary.routes.js';
import alumnoRoutes from './features/alumnos/alumno.routes.js';
import notificacionesRoutes from './features/notificaciones/notificaciones.routes.js';
import metodosPago from './features/metodosPago/metodo_pago.routes.js';
import coordinadorRoutes from './features/cordinador/coordinador.routes.js';

const app = express();
app.set('trust proxy', 1);
const morganFormat = ':method :url :status :response-time ms';

// Middlewares
app.use(helmet());

const corsOriginList = Array.isArray(CORS_ORIGIN) ? CORS_ORIGIN : [CORS_ORIGIN].filter(Boolean);
const normalizeOrigin = (origin) => origin.replace(/\/$/, '');

// Healthcheck route BEFORE CORS so it doesn't get blocked by strict origin policies
app.get('/', (req, res) => res.status(200).send('Gema Academy API is alive!'));
app.use('/health', healthRoutes);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalized = normalizeOrigin(origin);
      if (corsOriginList.includes(normalized)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: CORS_CREDENTIALS,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(' ')[0],
          url: message.split(' ')[1],
          status: message.split(' ')[2],
          responseTime: message.split(' ')[3],
        };
        logger.http(JSON.stringify(logObject));
      },
    },
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/horarios', horarioRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/inscripciones', inscripcionRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/sedes', sedeRoutes);
app.use('/api/canchas', canchasRoutes);
app.use('/api/niveles', nivelesRoutes);
app.use('/api/asistencias', asistenciaRoutes);
app.use('/api/cuentas-por-cobrar', cuentaPorCobrarRoutes);
app.use('/api/clases', claseRoutes);
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/alumno', alumnoRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/metodos-pago', metodosPago);
app.use('/api/coordinadores', coordinadorRoutes);

app.use(errorHandler);

export default app;
