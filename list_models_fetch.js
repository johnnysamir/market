const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// We'll use fetch directly since the SDK hides listModels in some versions or it's hard to access.
// Actually, simple fetch is easier to debug.
async function list() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log("Available models:");
            data.models.forEach(m => console.log(m.name));
        } else {
            console.log("Error listing:", JSON.stringify(data));
        }
    } catch (e) {
        console.log("Fetch error:", e.message);
    }
}
list();
