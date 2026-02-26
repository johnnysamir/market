const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
    let log = "";
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello?");
        log += "Success 1.5-flash: " + result.response.text() + "\n";
    } catch (e) {
        log += "Error 1.5-flash: " + e.toString() + "\nDetails: " + JSON.stringify(e, null, 2) + "\n";
        try {
            const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
            const resultPro = await modelPro.generateContent("Hello?");
            log += "Success pro: " + resultPro.response.text() + "\n";
        } catch (e2) {
            log += "Error pro: " + e2.toString() + "\nDetails: " + JSON.stringify(e2, null, 2) + "\n";
        }
    }
    fs.writeFileSync('error_gemini.log', log);
}

run();
