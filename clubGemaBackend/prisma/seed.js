import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed del Club GEMA...');

  // =================================================================
  // 1. ROLES
  // =================================================================
  console.log('📝 Configurando Roles...');

  await prisma.$transaction(async (tx) => {
    const roles = await Promise.all([
      tx.roles.upsert({
        where: { nombre: 'Alumno' },
        update: {},
        create: { nombre: 'Alumno', descripcion: 'Alumno inscrito' },
      }),
      tx.roles.upsert({
        where: { nombre: 'Coordinador' },
        update: {},
        create: { nombre: 'Coordinador', descripcion: 'Coordinador a cargo' },
      }),
      tx.roles.upsert({
        where: { nombre: 'Administrador' },
        update: {},
        create: { nombre: 'Administrador', descripcion: 'Administrador total' },
      }),
    ]);

    // =================================================================
    // 2. USUARIO ADMINISTRADOR
    // =================================================================
    console.log('👮 Creando Admin...');

    const rolAdmin = roles.find((r) => r.nombre === 'Administrador');
    if (!rolAdmin) {
      throw new Error('Rol Administrador no encontrado');
    }

    const admin = await tx.usuarios.upsert({
      where: { username: 'admin.gema' },
      update: {},
      create: {
        username: 'admin.gema',
        nombres: 'Super',
        apellidos: 'Admin',
        email: 'admin@gema.com',
        rol_id: rolAdmin.id,
        numero_documento: '00000001',
        activo: true,
      },
    });
    const passwordAdmin = await bcrypt.hash(admin.username, 10)
    await tx.credenciales_usuario.upsert({
      where: { usuario_id: admin.id },
      update: {},
      create: {
        usuario_id: admin.id,
        hash_contrasena: passwordAdmin
      }
    })

    // =================================================================
    // 3. INFRAESTRUCTURA
    // =================================================================
    console.log('🏢 Configurando Sede, Cancha y Niveles...');

    await tx.sedes.createMany({
      data: [
        { nombre: 'Surco', telefono_contacto: '970453788', distrito: 'Surco' },
        { nombre: 'Mirones', telefono_contacto: '970453717', distrito: 'Cercado de Lima' },
        { nombre: 'San Miguel - Tottus 1', telefono_contacto: '902585995', distrito: 'San Miguel' }
      ],
      skipDuplicates: true
    });

    const sedes = await tx.sedes.findMany();
    const surco = sedes.find(s => s.nombre === 'Surco')
    const mirones = sedes.find(s => s.nombre === 'Mirones')
    const sanMiguel = sedes.find(s => s.nombre === 'San Miguel - Tottus 1')
    if (!surco || !mirones || !sanMiguel) {
      throw new Error('No se encontraron algunas de las sedes requeridas');
    }

    await tx.canchas.createMany({
      data: [
        { sede_id: surco.id, nombre: 'Campo Techado 3 - Surco' },
        { sede_id: surco.id, nombre: 'Campo 4 Sin Techo - Surco' },
        { sede_id: mirones.id, nombre: 'Campo Techado 1 - Mirones' },
        { sede_id: sanMiguel.id, nombre: 'Cancha 1' },
        { sede_id: sanMiguel.id, nombre: 'Cancha 2' }
      ],
      skipDuplicates: true
    });

    await tx.niveles_entrenamiento.createMany({
      data: [
        { nombre: 'BÁSICO', precio_referencial: 100 },
        { nombre: 'PRE INTERMEDIO', precio_referencial: 100 },
        { nombre: 'INTERMEDIO', precio_referencial: 100 }
      ],
      skipDuplicates: true
    });

    // =================================================================
    // 4. CATÁLOGO DE PRECIOS
    // =================================================================
    console.log('💰 Configurando Catálogo de Precios...');

    await tx.catalogo_conceptos.createMany({
      data: [
        { codigo_interno: 'CLASE_UNITARIA_2026', nombre: 'Costo por Clase Unitaria (Referencial)', precio_base: 25.00, cantidad_clases_semanal: 0 },
        { codigo_interno: 'MENSUAL_1_DIA_2026', nombre: 'Mensualidad Básica (1 vez x semana)', precio_base: 90.00, cantidad_clases_semanal: 1 },
        { codigo_interno: 'MENSUAL_2_DIA_2026', nombre: 'Plan Estándar (2 veces x semana)', precio_base: 180.00, cantidad_clases_semanal: 2 },
        { codigo_interno: 'MENSUAL_3_DIA_2026', nombre: 'Plan Intensivo (3 veces x semana)', precio_base: 270.00, cantidad_clases_semanal: 3 },
        { codigo_interno: 'MENSUAL_4_DIA_2026', nombre: 'Plan Atleta (4 veces x semana)', precio_base: 300.00, cantidad_clases_semanal: 4 }
      ],
      skipDuplicates: true
    })

    // Métodos de pago base
    await tx.metodos_pago.createMany({
      data: [
        { nombre: 'YAPE' },
        { nombre: 'PLIN' },
        { nombre: 'TRANSFERENCIA' },
        { nombre: 'EFECTIVO' }
      ],
      skipDuplicates: true
    })

    console.log('✅✅ SEED MAESTRO COMPLETADO.');
  })
}

main()
  .catch((e) => {
    console.error('❌ Error fatal en el Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });