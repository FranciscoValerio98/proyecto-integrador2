-- CreateTable
CREATE TABLE "administrador" (
    "usuario_id" INTEGER NOT NULL,
    "sede_id" INTEGER,
    "cargo" VARCHAR(100) NOT NULL,
    "area" VARCHAR(100),

    CONSTRAINT "administrador_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "alumnos" (
    "usuario_id" INTEGER NOT NULL,
    "direccion_id" INTEGER,
    "condiciones_medicas" TEXT,
    "seguro_medico" VARCHAR(100),
    "grupo_sanguineo" VARCHAR(5),

    CONSTRAINT "alumnos_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "alumnos_contactos" (
    "id" SERIAL NOT NULL,
    "alumno_id" INTEGER NOT NULL,
    "nombre_completo" VARCHAR(150) NOT NULL,
    "relacion" VARCHAR(50),
    "telefono" VARCHAR(20) NOT NULL,
    "es_principal" BOOLEAN DEFAULT false,

    CONSTRAINT "alumnos_contactos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canchas" (
    "id" SERIAL NOT NULL,
    "sede_id" INTEGER NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(200),

    CONSTRAINT "canchas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo_conceptos" (
    "id" SERIAL NOT NULL,
    "codigo_interno" VARCHAR(20),
    "nombre" VARCHAR(150) NOT NULL,
    "precio_base" DECIMAL(10,2) NOT NULL,
    "activo" BOOLEAN DEFAULT true,
    "es_vigente" BOOLEAN NOT NULL DEFAULT true,
    "cantidad_clases_semanal" INTEGER,

    CONSTRAINT "catalogo_conceptos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "congelamientos" (
    "id" SERIAL NOT NULL,
    "inscripcion_id" INTEGER NOT NULL,
    "solicitud_lesion_id" INTEGER,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE,
    "dias_reconocidos" INTEGER DEFAULT 0,
    "estado" VARCHAR(20) DEFAULT 'ACTIVO',

    CONSTRAINT "congelamientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credenciales_usuario" (
    "usuario_id" INTEGER NOT NULL,
    "hash_contrasena" VARCHAR(255) NOT NULL,
    "ultimo_login" TIMESTAMP(6),
    "bloqueado" BOOLEAN DEFAULT false,

    CONSTRAINT "credenciales_usuario_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "cuentas_por_cobrar" (
    "id" SERIAL NOT NULL,
    "alumno_id" INTEGER NOT NULL,
    "concepto_id" INTEGER,
    "detalle_adicional" VARCHAR(200),
    "monto_final" DECIMAL(10,2) NOT NULL,
    "fecha_vencimiento" DATE NOT NULL,
    "estado" VARCHAR(20) DEFAULT 'PENDIENTE',
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cuentas_por_cobrar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direcciones" (
    "id" SERIAL NOT NULL,
    "direccion_completa" VARCHAR(255) NOT NULL,
    "distrito" VARCHAR(100) NOT NULL,
    "ciudad" VARCHAR(100) DEFAULT 'Lima',
    "referencia" TEXT,
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "direcciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horarios_clases" (
    "id" SERIAL NOT NULL,
    "cancha_id" INTEGER NOT NULL,
    "profesor_id" INTEGER NOT NULL,
    "nivel_id" INTEGER NOT NULL,
    "dia_semana" INTEGER NOT NULL,
    "hora_inicio" TIME(6) NOT NULL,
    "hora_fin" TIME(6) NOT NULL,
    "capacidad_max" INTEGER DEFAULT 20,
    "activo" BOOLEAN DEFAULT true,
    "minutos_reserva_especifico" INTEGER,

    CONSTRAINT "horarios_clases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscripciones" (
    "id" SERIAL NOT NULL,
    "alumno_id" INTEGER NOT NULL,
    "horario_id" INTEGER NOT NULL,
    "fecha_inscripcion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" VARCHAR(20) DEFAULT 'PENDIENTE_PAGO',
    "actualizado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inscripciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metodos_pago" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "activo" BOOLEAN DEFAULT true,

    CONSTRAINT "metodos_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "niveles_entrenamiento" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "precio_referencial" DECIMAL(10,2),

    CONSTRAINT "niveles_entrenamiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" SERIAL NOT NULL,
    "cuenta_id" INTEGER NOT NULL,
    "metodo_pago_id" INTEGER NOT NULL,
    "monto_pagado" DECIMAL(10,2) NOT NULL,
    "url_comprobante" VARCHAR(255),
    "codigo_operacion" VARCHAR(50),
    "fecha_pago" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "estado_validacion" VARCHAR(20) DEFAULT 'PENDIENTE',
    "revisado_por" INTEGER,
    "notas_validacion" VARCHAR(200),

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profesores" (
    "usuario_id" INTEGER NOT NULL,
    "especializacion" VARCHAR(100),

    CONSTRAINT "profesores_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "recuperaciones" (
    "id" SERIAL NOT NULL,
    "alumno_id" INTEGER NOT NULL,
    "fecha_falta" DATE NOT NULL,
    "motivo_falta" VARCHAR(50) DEFAULT 'PERSONAL',
    "horario_destino_id" INTEGER,
    "registro_asistencia_id" INTEGER,
    "fecha_programada" DATE,
    "es_por_lesion" BOOLEAN DEFAULT false,
    "solicitud_lesion_id" INTEGER,
    "estado" VARCHAR(20) DEFAULT 'PROGRAMADA',

    CONSTRAINT "recuperaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_asistencia" (
    "id" SERIAL NOT NULL,
    "inscripcion_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "estado" VARCHAR(20) DEFAULT 'PRESENTE',
    "comentario" TEXT,
    "registrado_por" INTEGER,
    "registrado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_asistencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(200),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sedes" (
    "id" SERIAL NOT NULL,
    "direccion_id" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "telefono_contacto" VARCHAR(20),
    "tipo_instalacion" VARCHAR(50),
    "activo" BOOLEAN DEFAULT true,

    CONSTRAINT "sedes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes_lesion" (
    "id" SERIAL NOT NULL,
    "alumno_id" INTEGER NOT NULL,
    "fecha_solicitud" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "descripcion_lesion" TEXT NOT NULL,
    "url_evidencia_medica" VARCHAR(255) NOT NULL,
    "estado" VARCHAR(20) DEFAULT 'PENDIENTE',
    "revisado_por" INTEGER,
    "notas_admin" TEXT,

    CONSTRAINT "solicitudes_lesion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_documento" (
    "id" VARCHAR(10) NOT NULL,
    "descripcion" VARCHAR(50) NOT NULL,

    CONSTRAINT "tipos_documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "tipo_documento_id" VARCHAR(10),
    "numero_documento" VARCHAR(20),
    "nombres" VARCHAR(100) NOT NULL,
    "apellidos" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150),
    "telefono_personal" VARCHAR(20),
    "fecha_nacimiento" DATE,
    "genero" CHAR(1),
    "activo" BOOLEAN DEFAULT true,
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "descuentos_aplicados" (
    "id" SERIAL NOT NULL,
    "cuenta_id" INTEGER NOT NULL,
    "tipo_beneficio_id" INTEGER NOT NULL,
    "monto_nominal_aplicado" DECIMAL(10,2) NOT NULL,
    "monto_dinero_descontado" DECIMAL(10,2) NOT NULL,
    "motivo_detalle" VARCHAR(255),
    "aplicado_por" INTEGER,
    "fecha_aplicacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "descuentos_aplicados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_beneficio" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "es_porcentaje" BOOLEAN DEFAULT false,
    "valor_por_defecto" DECIMAL(10,2),
    "activo" BOOLEAN DEFAULT true,

    CONSTRAINT "tipos_beneficio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parametros_sistema" (
    "id" SERIAL NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descripcion" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parametros_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beneficios_pendientes" (
    "id" SERIAL NOT NULL,
    "alumno_id" INTEGER NOT NULL,
    "tipo_beneficio_id" INTEGER NOT NULL,
    "asignado_por" INTEGER NOT NULL,
    "motivo" VARCHAR(255),
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "fecha_asignacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beneficios_pendientes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_conceptos_codigo_interno_key" ON "catalogo_conceptos"("codigo_interno");

-- CreateIndex
CREATE UNIQUE INDEX "unica_cancha_hora" ON "horarios_clases"("cancha_id", "dia_semana", "hora_inicio");

-- CreateIndex
CREATE UNIQUE INDEX "unica_inscripcion_alumno" ON "inscripciones"("alumno_id", "horario_id");

-- CreateIndex
CREATE UNIQUE INDEX "metodos_pago_nombre_key" ON "metodos_pago"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "unica_recuperacion_slot" ON "recuperaciones"("alumno_id", "horario_destino_id", "fecha_programada");

-- CreateIndex
CREATE UNIQUE INDEX "asistencia_unica_diaria" ON "registros_asistencia"("inscripcion_id", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- CreateIndex
CREATE UNIQUE INDEX "uq_documento" ON "usuarios"("tipo_documento_id", "numero_documento");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_beneficio_nombre_key" ON "tipos_beneficio"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_usuario_id_idx" ON "refresh_tokens"("usuario_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "parametros_sistema_clave_key" ON "parametros_sistema"("clave");

-- AddForeignKey
ALTER TABLE "administrador" ADD CONSTRAINT "administrador_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administrador" ADD CONSTRAINT "administrador_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "alumnos" ADD CONSTRAINT "alumnos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "alumnos" ADD CONSTRAINT "alumnos_direccion_id_fkey" FOREIGN KEY ("direccion_id") REFERENCES "direcciones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "alumnos_contactos" ADD CONSTRAINT "alumnos_contactos_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "canchas" ADD CONSTRAINT "canchas_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "congelamientos" ADD CONSTRAINT "congelamientos_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "inscripciones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "congelamientos" ADD CONSTRAINT "congelamientos_solicitud_lesion_id_fkey" FOREIGN KEY ("solicitud_lesion_id") REFERENCES "solicitudes_lesion"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "credenciales_usuario" ADD CONSTRAINT "credenciales_usuario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cuentas_por_cobrar" ADD CONSTRAINT "cuentas_por_cobrar_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cuentas_por_cobrar" ADD CONSTRAINT "cuentas_por_cobrar_concepto_id_fkey" FOREIGN KEY ("concepto_id") REFERENCES "catalogo_conceptos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "horarios_clases" ADD CONSTRAINT "horarios_clases_cancha_id_fkey" FOREIGN KEY ("cancha_id") REFERENCES "canchas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios_clases" ADD CONSTRAINT "horarios_clases_nivel_id_fkey" FOREIGN KEY ("nivel_id") REFERENCES "niveles_entrenamiento"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "horarios_clases" ADD CONSTRAINT "horarios_clases_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "profesores"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_horario_id_fkey" FOREIGN KEY ("horario_id") REFERENCES "horarios_clases"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_cuenta_id_fkey" FOREIGN KEY ("cuenta_id") REFERENCES "cuentas_por_cobrar"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_metodo_pago_id_fkey" FOREIGN KEY ("metodo_pago_id") REFERENCES "metodos_pago"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_revisado_por_fkey" FOREIGN KEY ("revisado_por") REFERENCES "administrador"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "profesores" ADD CONSTRAINT "profesores_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "recuperaciones" ADD CONSTRAINT "recuperaciones_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "recuperaciones" ADD CONSTRAINT "recuperaciones_horario_destino_id_fkey" FOREIGN KEY ("horario_destino_id") REFERENCES "horarios_clases"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "recuperaciones" ADD CONSTRAINT "recuperaciones_solicitud_lesion_id_fkey" FOREIGN KEY ("solicitud_lesion_id") REFERENCES "solicitudes_lesion"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registros_asistencia" ADD CONSTRAINT "registros_asistencia_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "inscripciones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registros_asistencia" ADD CONSTRAINT "registros_asistencia_registrado_por_fkey" FOREIGN KEY ("registrado_por") REFERENCES "profesores"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sedes" ADD CONSTRAINT "sedes_direccion_id_fkey" FOREIGN KEY ("direccion_id") REFERENCES "direcciones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "solicitudes_lesion" ADD CONSTRAINT "solicitudes_lesion_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "solicitudes_lesion" ADD CONSTRAINT "solicitudes_lesion_revisado_por_fkey" FOREIGN KEY ("revisado_por") REFERENCES "administrador"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_tipo_documento_id_fkey" FOREIGN KEY ("tipo_documento_id") REFERENCES "tipos_documento"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "descuentos_aplicados" ADD CONSTRAINT "descuentos_aplicados_aplicado_por_fkey" FOREIGN KEY ("aplicado_por") REFERENCES "administrador"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "descuentos_aplicados" ADD CONSTRAINT "descuentos_aplicados_cuenta_id_fkey" FOREIGN KEY ("cuenta_id") REFERENCES "cuentas_por_cobrar"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "descuentos_aplicados" ADD CONSTRAINT "descuentos_aplicados_tipo_beneficio_id_fkey" FOREIGN KEY ("tipo_beneficio_id") REFERENCES "tipos_beneficio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "beneficios_pendientes" ADD CONSTRAINT "beneficios_pendientes_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficios_pendientes" ADD CONSTRAINT "beneficios_pendientes_tipo_beneficio_id_fkey" FOREIGN KEY ("tipo_beneficio_id") REFERENCES "tipos_beneficio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
