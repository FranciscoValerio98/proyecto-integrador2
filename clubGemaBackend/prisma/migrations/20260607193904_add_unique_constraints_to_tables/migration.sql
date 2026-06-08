/*
  Warnings:

  - A unique constraint covering the columns `[sede_id,nombre]` on the table `canchas` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre]` on the table `niveles_entrenamiento` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre]` on the table `sedes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "canchas_sede_id_nombre_key" ON "canchas"("sede_id", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "niveles_entrenamiento_nombre_key" ON "niveles_entrenamiento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "sedes_nombre_key" ON "sedes"("nombre");
