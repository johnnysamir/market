const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkView() {
    try {
        const data = await prisma.$queryRaw`SELECT * FROM v_chatbot_publicaciones`;
        console.log("View data count:", data.length);
        console.log("First item:", data[0]);
    } catch (e) {
        console.error("View check failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

checkView();
