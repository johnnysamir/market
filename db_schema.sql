-- Script de creación de Base de Datos para Inmobiliaria La Casona
-- Ejecutar en PostgreSQL

-- 1. Crear la base de datos (Ejecutar esto primero si no existe)
-- CREATE DATABASE inmobiliaria_db;

-- 2. Conectarse a la base de datos recién creada antes de correr lo siguiente
-- \c inmobiliaria_db;

-- Tabla de Usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Se debe guardar encriptada
    nombre_completo VARCHAR(100),
    telefono VARCHAR(50),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Principal de Propiedades
CREATE TABLE propiedades (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id), -- Agente o dueño que publica
    
    -- Información Principal
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_operacion VARCHAR(50) NOT NULL, -- 'venta', 'alquiler', 'temporal'
    tipo_inmueble VARCHAR(50) NOT NULL, -- 'casa', 'departamento', 'ph', 'terreno', 'local', 'oficina'
    
    -- Precio
    moneda VARCHAR(3) DEFAULT 'USD', -- 'USD' o 'ARS'
    precio DECIMAL(15, 2) NOT NULL,
    
    -- Ubicación
    calle VARCHAR(150),
    altura VARCHAR(20),
    piso VARCHAR(10),
    unidad VARCHAR(10), -- Depto
    barrio VARCHAR(100),
    ciudad VARCHAR(100),
    codigo_postal VARCHAR(20),
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    direccion_visible BOOLEAN DEFAULT TRUE,
    
    -- Características Físicas
    superficie_total INTEGER, -- en m2
    superficie_cubierta INTEGER, -- en m2
    ambientes INTEGER,
    dormitorios INTEGER,
    banos INTEGER,
    cocheras INTEGER,
    
    -- Estado de la publicación
    estado VARCHAR(20) DEFAULT 'activo', -- 'activo', 'reservado', 'vendido', 'pausado'
    visitas_contador INTEGER DEFAULT 0,
    
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para Imágenes de las Propiedades
CREATE TABLE imagenes_propiedad (
    id SERIAL PRIMARY KEY,
    propiedad_id INTEGER REFERENCES propiedades(id) ON DELETE CASCADE,
    url_imagen TEXT NOT NULL, -- URL donde se aloja la imagen (S3, Cloudinary, local, etc)
    orden INTEGER DEFAULT 0,
    es_principal BOOLEAN DEFAULT FALSE
);

-- Tabla para Favoritos (Relación muchos a muchos)
CREATE TABLE favoritos (
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    propiedad_id INTEGER REFERENCES propiedades(id) ON DELETE CASCADE,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, propiedad_id)
);

-- Índices para mejorar búsquedas comunes
CREATE INDEX idx_propiedades_tipo_operacion ON propiedades(tipo_operacion);
CREATE INDEX idx_propiedades_tipo_inmueble ON propiedades(tipo_inmueble);
CREATE INDEX idx_propiedades_precio ON propiedades(precio);
CREATE INDEX idx_propiedades_barrio ON propiedades(barrio);

-- Insertar un usuario de prueba (clave: 1234 - hash generico de ejemplo)
INSERT INTO usuarios (email, password_hash, nombre_completo) 
VALUES ('mariayvargas@hotmail.com', 'hash_de_prueba_1234', 'Maria Vargas');
