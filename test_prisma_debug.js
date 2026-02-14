require('dotenv').config();
console.log('DB URL:', process.env.DATABASE_URL);
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const propiedades = await prisma.propiedades.findMany();
        console.log('Got properties:', propiedades.length);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
