-- AlterTable
ALTER TABLE "parametros_sistema" ALTER COLUMN "actualizado_en" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "actualizado_en" SET DATA TYPE TIMESTAMP(6);
