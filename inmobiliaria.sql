-- Script Completo de Base de Datos para Inmobiliaria La Casona
-- Generado el: 2026-02-13
-- Motor: PostgreSQL

-- ==========================================
-- 1. CONFIGURACIÓN INICIAL
-- ==========================================

-- Eliminar tablas si existen para empezar de cero (Cuidado con datos existentes)
DROP TABLE IF EXISTS contactos CASCADE;
DROP TABLE IF EXISTS tasaciones CASCADE;
DROP TABLE IF EXISTS favoritos CASCADE;
DROP TABLE IF EXISTS imagenes_propiedad CASCADE;
DROP TABLE IF EXISTS propiedades CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- ==========================================
-- 2. TABLAS PRINCIPALES
-- ==========================================

-- Tabla de Usuarios (Agentes, Administradores, Clientes)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Contraseña encriptada
    nombre_completo VARCHAR(100) NOT NULL,
    telefono VARCHAR(50),
    rol VARCHAR(20) DEFAULT 'cliente', -- 'admin', 'adgente', 'cliente'
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla de Propiedades (Inmuebles - Formulario publicar-propiedad.html)
CREATE TABLE propiedades (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL, -- Quién publicó la propiedad
    
    -- Información Básica 
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_operacion VARCHAR(50) NOT NULL CHECK (tipo_operacion IN ('venta', 'alquiler', 'temporal')),
    tipo_inmueble VARCHAR(50) NOT NULL CHECK (tipo_inmueble IN ('casa', 'departamento', 'ph', 'terreno', 'local', 'oficina', 'otro')),
    
    -- Precio y Moneda
    moneda VARCHAR(3) DEFAULT 'USD' CHECK (moneda IN ('USD', 'ARS')),
    precio DECIMAL(15, 2) NOT NULL,
    
    -- Ubicación
    calle VARCHAR(150),
    altura VARCHAR(20),
    piso VARCHAR(10),
    departamento VARCHAR(10), 
    barrio VARCHAR(100),
    ciudad VARCHAR(100),
    codigo_postal VARCHAR(20),
    latitud DECIMAL(10, 8), -- Para mostrar en mapa exacto
    longitud DECIMAL(11, 8), 
    direccion_visible BOOLEAN DEFAULT TRUE, -- Checkbox "Mostrar dirección exacta"
    
    -- Características Físicas
    superficie_total DECIMAL(10, 2), -- m2
    superficie_cubierta DECIMAL(10, 2), -- m2
    ambientes INTEGER,
    dormitorios INTEGER,
    banos INTEGER,
    cocheras INTEGER,
    
    -- Estado de la publicación y Gestión
    estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'reservado', 'vendido', 'alquilado', 'pausado')),
    visitas_contador INTEGER DEFAULT 0,
    destacada BOOLEAN DEFAULT FALSE, -- Para mostrar en sección destacados
    
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Imágenes (Relación 1 a N con Propiedades)
CREATE TABLE imagenes_propiedad (
    id SERIAL PRIMARY KEY,
    propiedad_id INTEGER REFERENCES propiedades(id) ON DELETE CASCADE,
    url_imagen TEXT NOT NULL, -- Ruta o URL del archivo
    orden INTEGER DEFAULT 0, -- Para ordenar la galería
    es_principal BOOLEAN DEFAULT FALSE, -- Foto de portada
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Favoritos (Relación N a M entre Usuarios y Propiedades)
CREATE TABLE favoritos (
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    propiedad_id INTEGER REFERENCES propiedades(id) ON DELETE CASCADE,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, propiedad_id)
);

-- ==========================================
-- 3. TABLAS DE FORMULARIOS (CONTACTO Y TASACIÓN)
-- ==========================================

-- Tabla de Solicitudes de Tasación (Formulario tasacion.html)
CREATE TABLE tasaciones (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    tipo_propiedad VARCHAR(50), -- casa, departamento, ph, etc.
    direccion_propiedad VARCHAR(255) NOT NULL,
    mensaje_adicional TEXT,
    
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'tasada', 'cancelada')),
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Mensajes de Contacto (Formulario contacto.html)
CREATE TABLE contactos (
    id SERIAL PRIMARY KEY,
    propiedad_id INTEGER REFERENCES propiedades(id) ON DELETE SET NULL, -- Opcional, si viene de una ficha
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    mensaje TEXT NOT NULL,
    
    leido BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. ÍNDICES Y OPTIMIZACIÓN
-- ==========================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_propiedades_operacion ON propiedades(tipo_operacion);
CREATE INDEX idx_propiedades_tipo ON propiedades(tipo_inmueble);
CREATE INDEX idx_propiedades_precio ON propiedades(precio);
CREATE INDEX idx_propiedades_ubicacion ON propiedades(barrio, ciudad);
CREATE INDEX idx_propiedades_estado ON propiedades(estado);
CREATE INDEX idx_tasaciones_estado ON tasaciones(estado);

-- ==========================================
-- 5. DATOS DE EJEMPLO (SEEDING)
-- ==========================================

INSERT INTO usuarios (email, password_hash, nombre_completo, rol) 
VALUES ('admin@lacasona.com', 'hashencriptado123', 'Admin Sistema', 'admin');

-- Propiedad de Ejemplo
INSERT INTO propiedades (usuario_id, titulo, descripcion, tipo_operacion, tipo_inmueble, moneda, precio, calle, altura, barrio, ciudad, ambientes, dormitorios, banos, superficie_total, destacada)
VALUES (1, 'Hermosa Casa en Palermo Soho', 'Casa reciclada a nuevo con patio y parrilla.', 'venta', 'casa', 'USD', 350000.00, 'Gurruchaga', '1500', 'Palermo', 'CABA', 4, 3, 2, 180.00, TRUE);