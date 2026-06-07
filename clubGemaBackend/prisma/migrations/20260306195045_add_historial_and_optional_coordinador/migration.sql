-- AlterTable
ALTER TABLE "alumnos" ADD COLUMN     "historial" TEXT;

-- AlterTable
ALTER TABLE "horarios_clases" ALTER COLUMN "coordinador_id" DROP NOT NULL;
