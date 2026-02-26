const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testFull() {
    console.log("1. Testing Database View...");
    try {
        const catalogo = await prisma.$queryRaw`SELECT * FROM v_chatbot_publicaciones`;
        console.log(`   OK. Found ${catalogo.length} properties.`);

        console.log("2. Simulating Chat Logic...");
        const catalogoStr = JSON.stringify(catalogo.slice(0, 3)); // Mocking the filter

        console.log("3. Testing Gemini API (gemini-2.5-flash)...");
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: `Acting as real estate agent. Catalog: ${catalogoStr}`
        });

        const chat = model.startChat({ history: [] });
        const result = await chat.sendMessage("Hola, busco casa");
        const response = await result.response;
        const text = response.text();

        console.log("   OK. Gemini Response:", text);

    } catch (e) {
        console.error("   FAILED:", e);
    } finally {
        await prisma.$disconnect();
    }
}

testFull();
