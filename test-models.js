require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    try {
        // We can't easily list models with the SDK without a direct fetch if not using the newer versions
        // but let's try gemini-1.5-flash-latest and gemini-1.5-pro 
        const genAI = new GoogleGenerativeAI(key);

        const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro", "gemini-1.5-pro"];

        for (const m of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent("hi");
                console.log(`Model ${m} WORKS!`);
                return;
            } catch (e) {
                console.log(`Model ${m} FAILED: ${e.message}`);
            }
        }
    } catch (error) {
        console.error("List failed:", error);
    }
}

listModels();
