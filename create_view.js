const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createView() {
    try {
        console.log("Creating view v_chatbot_publicaciones...");

        await prisma.$executeRawUnsafe(`
            CREATE OR REPLACE VIEW v_chatbot_publicaciones AS
            SELECT
                id,
                titulo,
                tipo_inmueble,
                tipo_operacion,
                precio,
                moneda,
                barrio,
                ciudad,
                destacada,
                CONCAT(
                    titulo, ' ', 
                    COALESCE(descripcion, ''), ' ', 
                    tipo_inmueble, ' en ', 
                    COALESCE(barrio, ''), ', ', 
                    COALESCE(ciudad, ''), '. ',
                    tipo_operacion, ' ', 
                    COALESCE(moneda, 'USD'), ' ', 
                    precio
                ) as resumen_busqueda
            FROM
                propiedades
            WHERE
                estado = 'disponible';
        `);

        console.log("View created successfully!");

        // Verify
        const test = await prisma.$queryRaw`SELECT count(*)::int as count FROM v_chatbot_publicaciones`;
        console.log("View verified. Count:", test[0].count);

    } catch (e) {
        console.error("Error creating view:", e);
    } finally {
        await prisma.$disconnect();
    }
}

createView();
