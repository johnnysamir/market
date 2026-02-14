const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const res = await prisma.$queryRaw`
    SELECT conname, pg_get_constraintdef(oid) as def 
    FROM pg_constraint 
    WHERE conrelid = 'propiedades'::regclass AND contype = 'c'
  `;
    res.forEach(c => {
        console.log(`Constraint: ${c.conname}`);
        console.log(`Definition: ${c.def}`);
        console.log('---');
    });
}

main().finally(() => prisma.$disconnect());
