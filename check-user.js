const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    const user = await prisma.usuarios.findFirst();
    console.log(JSON.stringify(user));
    await prisma.$disconnect();
}
run();
