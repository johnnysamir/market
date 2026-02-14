const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    try {
        await prisma.usuarios.upsert({
            where: { email: 'admin@lacasona.com' },
            update: {},
            create: {
                id: 1,
                email: 'admin@lacasona.com',
                password_hash: '$2b$10$YourHashedPasswordHere', // Simplemente un hash de ejemplo
                nombre_completo: 'Admin Sistema',
                rol: 'admin'
            }
        });
        console.log('Admin verificado/creado');
    } catch (e) {
        console.error(e);
    }
    await prisma.$disconnect();
}
run();
