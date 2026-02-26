const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello?");
        console.log("Response:", result.response.text());
    } catch (e) {
        console.log("Error 1.5-flash:", e.message);
        try {
            const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
            const resultPro = await modelPro.generateContent("Hello?");
            console.log("Response pro:", resultPro.response.text());
        } catch (e2) {
            console.log("Error pro:", e2.message);
        }
    }
}

run();
