/*
  Warnings:

  - The required column `grupo_uuid` was added to the `reprogramaciones_clases` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "registros_asistencia" ADD COLUMN     "fecha_original" DATE;

-- AlterTable
ALTER TABLE "reprogramaciones_clases" ADD COLUMN     "es_masiva" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
ADD COLUMN     "grupo_uuid" UUID NOT NULL;
