require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("No GEMINI_API_KEY found in environment");
        return;
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        // This is not directly exposed in the high-level SDK easily, 
        // but we can try a simple generation with a known model to test connectivity.
        console.log("Testing gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-1.5-flash:", result.response.text());
    } catch (error) {
        console.error("Error with gemini-1.5-flash:", error.message);

        try {
            console.log("Testing gemini-pro...");
            const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
            const resultPro = await modelPro.generateContent("Hello");
            console.log("Success with gemini-pro:", resultPro.response.text());
        } catch (e2) {
            console.error("Error with gemini-pro:", e2.message);
        }
    }
}

listModels();
