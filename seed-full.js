const fs = require('fs');
const path = require('path');
const https = require('https');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

const images = [
    { name: 'penthouse.jpg', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800' },
    { name: 'mansion.jpg', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800' },
    { name: 'frances.jpg', url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=800' },
    { name: 'loft.jpg', url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800' },
    { name: 'moderna.jpg', url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=800' },
    { name: 'oficina_p.jpg', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800' },
    { name: 'local_c.jpg', url: 'https://images.unsplash.com/photo-1555529771-122e5d9f2341?q=80&w=800' },
    { name: 'industrial.jpg', url: 'https://images.unsplash.com/photo-1524230572899-a752b3835840?q=80&w=800' },
    { name: 'depto_p.jpg', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800' },
    { name: 'terraza.jpg', url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=800' },
    { name: 'quinta.jpg', url: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?q=80&w=800' },
    { name: 'caballito.jpg', url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=800' },
    { name: 'startup.jpg', url: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?q=80&w=800' },
    { name: 'restaurante.jpg', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800' },
    { name: 'duplex.jpg', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800' }
];

function download(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

const propiedades = [
    { titulo: 'Penthouse de Lujo Puerto Madero', desc: 'Vistas panorámicas al río. Terminaciones de mármol.', operacion: 'Venta', inmueble: 'Departamento', precio: 1250000, barrio: 'Puerto Madero', img: 'penthouse.jpg', destacada: true },
    { titulo: 'Mansión Minimalista Nordelta', desc: 'Piscina infinity y muelle propio.', operacion: 'Venta', inmueble: 'Casa', precio: 890000, barrio: 'Nordelta', img: 'mansion.jpg', destacada: true },
    { titulo: 'Petit Hotel Recoleta', desc: 'Joyas arquitectónica reciclada.', operacion: 'Venta', inmueble: 'Casa', precio: 2100000, barrio: 'Recoleta', img: 'frances.jpg', destacada: true },
    { titulo: 'Loft Industrial San Telmo', desc: 'Techos altos, vigas a la vista.', operacion: 'Venta', inmueble: 'Departamento', precio: 175000, barrio: 'San Telmo', img: 'loft.jpg', destacada: false },
    { titulo: 'Casa Moderna Villa Urquiza', desc: 'Construcción nueva con paneles solares.', operacion: 'Venta', inmueble: 'Casa', precio: 420000, barrio: 'Villa Urquiza', img: 'moderna.jpg', destacada: false },
    { titulo: 'Oficina Premium Catalinas', desc: 'Planta libre en torre de categoría.', operacion: 'Alquiler', inmueble: 'Oficina', precio: 4500, barrio: 'Retiro', img: 'oficina_p.jpg', destacada: false },
    { titulo: 'Local Comercial Barrio Norte', desc: 'Gran visibilidad sobre Av. Santa Fe.', operacion: 'Alquiler', inmueble: 'Local', precio: 850000, barrio: 'Barrio Norte', img: 'local_c.jpg', destacada: false },
    { titulo: 'Lote Industrial Ezeiza', desc: 'Terreno nivelado en parque industrial.', operacion: 'Venta', inmueble: 'Lote', precio: 150000, barrio: 'Ezeiza', img: 'industrial.jpg', destacada: false },
    { titulo: 'Depto Moderno Palermo', desc: 'A pasos de Plaza Cortázar con amenities.', operacion: 'Alquiler', inmueble: 'Departamento', precio: 450000, barrio: 'Palermo Soho', img: 'depto_p.jpg', destacada: false },
    { titulo: 'Duplex con Terraza Belgrano', desc: 'Parrilla propia y muy luminoso.', operacion: 'Alquiler', inmueble: 'Departamento', precio: 580000, barrio: 'Belgrano C', img: 'terraza.jpg', destacada: false },
    { titulo: 'Casa Quinta Olivos', desc: 'Ideal familia con gran jardín.', operacion: 'Alquiler', inmueble: 'Casa', precio: 2800, barrio: 'Olivos', img: 'quinta.jpg', destacada: false },
    { titulo: 'Depto Minimalista Caballito', desc: 'Ubicación estratégica cerca del subte.', operacion: 'Venta', inmueble: 'Departamento', precio: 135000, barrio: 'Caballito', img: 'caballito.jpg', destacada: false },
    { titulo: 'Oficina Coworking Nuñez', desc: 'Espacio moderno para startups.', operacion: 'Alquiler', inmueble: 'Oficina', precio: 300000, barrio: 'Nuñez', img: 'startup.jpg', destacada: false },
    { titulo: 'Restaurante Las Cañitas', desc: 'Equipado a nuevo para gastronomía.', operacion: 'Alquiler', inmueble: 'Local', precio: 720000, barrio: 'Las Cañitas', img: 'restaurante.jpg', destacada: false },
    { titulo: 'Duplex de Categoría Martinez', desc: 'Cerca del río en zona exclusiva.', operacion: 'Venta', inmueble: 'Casa', precio: 360000, barrio: 'Martinez', img: 'duplex.jpg', destacada: false }
];

async function main() {
    console.log('--- Limpiando datos previos ---');
    await prisma.imagenes_propiedad.deleteMany();
    await prisma.propiedades.deleteMany();

    console.log('--- Descargando imágenes ---');
    for (const img of images) {
        console.log(`Descargando ${img.name}...`);
        await download(img.url, path.join(UPLOADS_DIR, img.name));
    }

    console.log('--- Insertando propiedades ---');
    for (const p of propiedades) {
        const nueva = await prisma.propiedades.create({
            data: {
                usuario_id: 1, // Usuario admin
                titulo: p.titulo,
                descripcion: p.desc,
                tipo_operacion: p.operacion,
                tipo_inmueble: p.inmueble,
                precio: p.precio,
                moneda: p.precio > 50000 ? 'USD' : 'ARS', // Lógica simple para demo
                barrio: p.barrio,
                ciudad: 'Buenos Aires',
                estado: 'disponible',
                destacada: p.destacada,
                superficie_total: 100, // datos dummy
                superficie_cubierta: 80,
                dormitorios: 2,
                banos: 1,
                imagenes_propiedad: {
                    create: {
                        url_imagen: `/uploads/${p.img}`,
                        es_principal: true
                    }
                }
            }
        });
        console.log(`Propiedad creada: ${nueva.titulo}`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
