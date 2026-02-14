-- Limpieza total de tablas relacionadas con propiedades
DROP TABLE IF EXISTS "imagenes_propiedad" CASCADE;
DROP TABLE IF EXISTS "favoritos" CASCADE;
DROP TABLE IF EXISTS "contactos" CASCADE;
DROP TABLE IF EXISTS "propiedades" CASCADE;
-- Re-creación con los nombres exactos del schema de Prisma
CREATE TABLE "propiedades" (
    "id" SERIAL PRIMARY KEY,
    "usuario_id" INTEGER,
    "titulo" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "tipo_operacion" VARCHAR(50) NOT NULL,
    "tipo_inmueble" VARCHAR(50) NOT NULL,
    "moneda" VARCHAR(3) DEFAULT 'USD',
    "precio" DECIMAL(15, 2) NOT NULL,
    "calle" VARCHAR(150),
    "altura" VARCHAR(20),
    "piso" VARCHAR(10),
    "departamento" VARCHAR(10),
    "barrio" VARCHAR(100),
    "ciudad" VARCHAR(100),
    "codigo_postal" VARCHAR(20),
    "latitud" DECIMAL(10, 8),
    "longitud" DECIMAL(11, 8),
    "direccion_visible" BOOLEAN DEFAULT TRUE,
    "superficie_total" DECIMAL(10, 2),
    "superficie_cubierta" DECIMAL(10, 2),
    "ambientes" INTEGER,
    "dormitorios" INTEGER,
    "banos" INTEGER,
    "cocheras" INTEGER,
    "estado" VARCHAR(20) DEFAULT 'disponible',
    "visitas_contador" INTEGER DEFAULT 0,
    "destacada" BOOLEAN DEFAULT FALSE,
    "fecha_publicacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "propiedades_usuario_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON UPDATE NO ACTION
);
CREATE INDEX "idx_propiedades_estado" ON "propiedades"("estado");
CREATE INDEX "idx_propiedades_operacion" ON "propiedades"("tipo_operacion");
CREATE INDEX "idx_propiedades_precio" ON "propiedades"("precio");
CREATE INDEX "idx_propiedades_tipo" ON "propiedades"("tipo_inmueble");
CREATE INDEX "idx_propiedades_ubicacion" ON "propiedades"("barrio", "ciudad");
CREATE TABLE "imagenes_propiedad" (
    "id" SERIAL PRIMARY KEY,
    "propiedad_id" INTEGER,
    "url_imagen" TEXT NOT NULL,
    "orden" INTEGER DEFAULT 0,
    "es_principal" BOOLEAN DEFAULT FALSE,
    "fecha_subida" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "imagenes_propiedad_fkey" FOREIGN KEY ("propiedad_id") REFERENCES "propiedades" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);
CREATE TABLE "favoritos" (
    "usuario_id" INTEGER NOT NULL,
    "propiedad_id" INTEGER NOT NULL,
    "fecha_agregado" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("usuario_id", "propiedad_id"),
    CONSTRAINT "favoritos_usuario_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "favoritos_propiedad_fkey" FOREIGN KEY ("propiedad_id") REFERENCES "propiedades" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);
CREATE TABLE "contactos" (
    "id" SERIAL PRIMARY KEY,
    "propiedad_id" INTEGER,
    "nombre_completo" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "telefono" VARCHAR(50),
    "mensaje" TEXT NOT NULL,
    "leido" BOOLEAN DEFAULT FALSE,
    "fecha_envio" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contactos_propiedad_fkey" FOREIGN KEY ("propiedad_id") REFERENCES "propiedades" ("id") ON UPDATE NO ACTION
);