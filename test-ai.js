require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
    const key = process.env.GEMINI_API_KEY;
    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest" // Using exactly from the list
        });
        const result = await model.generateContent("Hola");
        console.log("Success! Response:", result.response.text());
    } catch (error) {
        console.error("Test failed:", error.message);
    }
}

test();
