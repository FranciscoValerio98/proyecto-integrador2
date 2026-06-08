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
    "cantidad_clases_semanal" INTEGER,

    CONSTRAINT "catalogo_conceptos_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "horarios_clases" (
    "id" SERIAL NOT NULL,
    "cancha_id" INTEGER NOT NULL,
    "coordinador_id" INTEGER,
    "nivel_id" INTEGER NOT NULL,
    "dia_semana" INTEGER NOT NULL,
    "hora_inicio" TIME(6) NOT NULL,
    "hora_fin" TIME(6) NOT NULL,
    "capacidad_max" INTEGER DEFAULT 20,
    "activo" BOOLEAN DEFAULT true,

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
CREATE TABLE "inscripciones_deudas_link" (
    "inscripcion_id" INTEGER NOT NULL,
    "cuenta_id" INTEGER NOT NULL,
    "monto_asignado" DECIMAL(10,2) NOT NULL,
    "creado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inscripciones_deudas_link_pkey" PRIMARY KEY ("inscripcion_id","cuenta_id")
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
CREATE TABLE "registros_asistencia" (
    "id" SERIAL NOT NULL,
    "inscripcion_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "estado" VARCHAR(20) DEFAULT 'PRESENTE',
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
    "nombre" VARCHAR(100) NOT NULL,
    "telefono_contacto" VARCHAR(20),
    "distrito" VARCHAR(100),
    "activo" BOOLEAN DEFAULT true,

    CONSTRAINT "sedes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "username" VARCHAR(50) NOT NULL,
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
CREATE TABLE "notificaciones" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER,
    "titulo" VARCHAR(100) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'INFO',
    "categoria" TEXT NOT NULL DEFAULT 'SISTEMA',
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_conceptos_codigo_interno_key" ON "catalogo_conceptos"("codigo_interno");

-- CreateIndex
CREATE UNIQUE INDEX "unica_cancha_hora" ON "horarios_clases"("cancha_id", "dia_semana", "hora_inicio");

-- CreateIndex
CREATE INDEX "inscripciones_deudas_link_cuenta_id_idx" ON "inscripciones_deudas_link"("cuenta_id");

-- CreateIndex
CREATE UNIQUE INDEX "metodos_pago_nombre_key" ON "metodos_pago"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "asistencia_unica_diaria" ON "registros_asistencia"("inscripcion_id", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_usuario_id_idx" ON "refresh_tokens"("usuario_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- AddForeignKey
ALTER TABLE "canchas" ADD CONSTRAINT "canchas_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credenciales_usuario" ADD CONSTRAINT "credenciales_usuario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cuentas_por_cobrar" ADD CONSTRAINT "cuentas_por_cobrar_concepto_id_fkey" FOREIGN KEY ("concepto_id") REFERENCES "catalogo_conceptos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "horarios_clases" ADD CONSTRAINT "horarios_clases_cancha_id_fkey" FOREIGN KEY ("cancha_id") REFERENCES "canchas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios_clases" ADD CONSTRAINT "horarios_clases_nivel_id_fkey" FOREIGN KEY ("nivel_id") REFERENCES "niveles_entrenamiento"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "horarios_clases" ADD CONSTRAINT "horarios_clases_coordinador_id_fkey" FOREIGN KEY ("coordinador_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_horario_id_fkey" FOREIGN KEY ("horario_id") REFERENCES "horarios_clases"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inscripciones_deudas_link" ADD CONSTRAINT "inscripciones_deudas_link_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "inscripciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_deudas_link" ADD CONSTRAINT "inscripciones_deudas_link_cuenta_id_fkey" FOREIGN KEY ("cuenta_id") REFERENCES "cuentas_por_cobrar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_cuenta_id_fkey" FOREIGN KEY ("cuenta_id") REFERENCES "cuentas_por_cobrar"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_metodo_pago_id_fkey" FOREIGN KEY ("metodo_pago_id") REFERENCES "metodos_pago"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_revisado_por_fkey" FOREIGN KEY ("revisado_por") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registros_asistencia" ADD CONSTRAINT "registros_asistencia_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "inscripciones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registros_asistencia" ADD CONSTRAINT "registros_asistencia_registrado_por_fkey" FOREIGN KEY ("registrado_por") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
