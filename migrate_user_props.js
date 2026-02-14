const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const userId = 2;

    const properties = [
        {
            title: "Departamento Recoleta",
            price: 120000,
            tipo_operacion: "venta",
            tipo_inmueble: "departamento",
            images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"],
            status: "disponible",
            views: 245,
            barrio: "Recoleta"
        },
        {
            title: "Casa en San Isidro",
            price: 450000,
            tipo_operacion: "venta",
            tipo_inmueble: "casa",
            images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"],
            status: "reservado",
            views: 1120,
            barrio: "San Isidro"
        },
        {
            title: "Lote en Costa Esmeralda",
            price: 45000,
            tipo_operacion: "venta",
            tipo_inmueble: "terreno",
            images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"],
            status: "vendido",
            views: 890,
            barrio: "Costa Esmeralda"
        }
    ];

    console.log(`Iniciando migración para usuario ID ${userId}...`);

    try {
        for (const prop of properties) {
            const createdProp = await prisma.propiedades.create({
                data: {
                    usuario_id: userId,
                    titulo: prop.title,
                    descripcion: "Excelente oportunidad.",
                    tipo_operacion: prop.tipo_operacion,
                    tipo_inmueble: prop.tipo_inmueble,
                    moneda: "USD",
                    precio: prop.price,
                    estado: prop.status,
                    visitas_contador: prop.views,
                    ciudad: "Buenos Aires",
                    barrio: prop.barrio,
                    calle: "Av. Del Libertador",
                    altura: "1234",
                    imagenes_propiedad: {
                        create: prop.images.map((url, index) => ({
                            url_imagen: url,
                            orden: index,
                            es_principal: index === 0
                        }))
                    }
                }
            });
            console.log(`✔ Insertada: ${createdProp.titulo} (ID: ${createdProp.id})`);
        }
        console.log('Migración finalizada con éxito.');
    } catch (error) {
        if (error.code === 'P2003') {
            console.error('Error de llave foránea: El usuario 2 existe?');
        } else if (error.code === 'P2010') {
            console.error('Error de restricción (Check Constraint): Verifique los valores de tipo_operacion, tipo_inmueble, estado.');
            console.error(error.message);
        } else {
            console.error('Error inesperado:', error);
        }
    }
}

main().finally(() => prisma.$disconnect());
