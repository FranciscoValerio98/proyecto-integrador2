-- AlterTable
ALTER TABLE "registros_asistencia" ADD COLUMN     "reprogramacion_clase_id" INTEGER;

-- CreateTable
CREATE TABLE "reprogramaciones_clases" (
    "id" SERIAL NOT NULL,
    "horario_id" INTEGER NOT NULL,
    "fecha_origen" DATE NOT NULL,
    "fecha_destino" DATE NOT NULL,
    "hora_inicio_destino" VARCHAR(5) NOT NULL,
    "hora_fin_destino" VARCHAR(5) NOT NULL,
    "motivo" TEXT,
    "creado_por" INTEGER,
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reprogramaciones_clases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unica_reprogramacion_origen_destino" ON "reprogramaciones_clases"("horario_id", "fecha_origen", "fecha_destino");

-- AddForeignKey
ALTER TABLE "registros_asistencia" ADD CONSTRAINT "registros_asistencia_reprogramacion_clase_id_fkey" FOREIGN KEY ("reprogramacion_clase_id") REFERENCES "reprogramaciones_clases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reprogramaciones_clases" ADD CONSTRAINT "reprogramaciones_clases_horario_id_fkey" FOREIGN KEY ("horario_id") REFERENCES "horarios_clases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reprogramaciones_clases" ADD CONSTRAINT "reprogramaciones_clases_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "coordinadores"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;
