const fs = require('fs');
require('dotenv').config();

async function list() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            const names = data.models.map(m => m.name).join('\n');
            fs.writeFileSync('available_models.txt', names);
        } else {
            console.log("Error listing:", JSON.stringify(data));
        }
    } catch (e) {
        console.log("Fetch error:", e.message);
    }
}
list();
