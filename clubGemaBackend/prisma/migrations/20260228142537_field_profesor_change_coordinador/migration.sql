/*
  Warnings:

  - You are about to drop the column `profesor_id` on the `horarios_clases` table. All the data in the column will be lost.
  - You are about to drop the `profesores` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `coordinador_id` to the `horarios_clases` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "horarios_clases" DROP CONSTRAINT "horarios_clases_profesor_id_fkey";

-- DropForeignKey
ALTER TABLE "profesores" DROP CONSTRAINT "profesores_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "registros_asistencia" DROP CONSTRAINT "registros_asistencia_registrado_por_fkey";

-- AlterTable
ALTER TABLE "horarios_clases" DROP COLUMN "profesor_id",
ADD COLUMN     "coordinador_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "profesores";

-- CreateTable
CREATE TABLE "coordinadores" (
    "usuario_id" INTEGER NOT NULL,
    "especializacion" VARCHAR(100),

    CONSTRAINT "coordinadores_pkey" PRIMARY KEY ("usuario_id")
);

-- AddForeignKey
ALTER TABLE "horarios_clases" ADD CONSTRAINT "horarios_clases_coordinador_id_fkey" FOREIGN KEY ("coordinador_id") REFERENCES "coordinadores"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "coordinadores" ADD CONSTRAINT "coordinadores_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registros_asistencia" ADD CONSTRAINT "registros_asistencia_registrado_por_fkey" FOREIGN KEY ("registrado_por") REFERENCES "coordinadores"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
