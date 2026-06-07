-- CreateTable
CREATE TABLE "publicaciones" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "contenido" TEXT NOT NULL,
    "imagen_url" VARCHAR(255),
    "autor_id" INTEGER NOT NULL,
    "activo" BOOLEAN DEFAULT true,
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(6),

    CONSTRAINT "publicaciones_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "administrador"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
