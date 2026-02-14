const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const res = await prisma.$queryRaw`INSERT INTO "propiedades" (usuario_id, titulo, descripcion, tipo_operacion, tipo_inmueble, moneda, precio, calle, altura, ciudad) VALUES (2, 'Test', 'Test desc', 'Venta', 'Casa', 'USD', 1000, 'Calle 1', '100', 'CABA') RETURNING id`;
        console.log('Insert success:', res);
    } catch (e) {
        console.error('Raw SQL Error:', e);
    }
}

main().finally(() => prisma.$disconnect());
