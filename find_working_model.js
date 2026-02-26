const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelsToTest = [
    "gemini-2.0-flash",
    "models/gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-pro"
];

async function test() {
    for (const modelName of modelsToTest) {
        console.log(`Testing model: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            console.log(`SUCCESS with ${modelName}:`, result.response.text());
            return; // Found one!
        } catch (e) {
            console.log(`FAILED ${modelName}:`, e.message.split('\n')[0]);
        }
    }
}

test();
