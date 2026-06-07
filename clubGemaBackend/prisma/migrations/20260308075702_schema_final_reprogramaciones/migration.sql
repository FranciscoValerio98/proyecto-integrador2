-- DropForeignKey
ALTER TABLE "reprogramaciones_clases" DROP CONSTRAINT "reprogramaciones_clases_creado_por_fkey";

-- AddForeignKey
ALTER TABLE "reprogramaciones_clases" ADD CONSTRAINT "reprogramaciones_clases_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
