require('dotenv').config();
const key = process.env.GEMINI_API_KEY;

async function testFetch() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log("Models available:");
            data.models.forEach(m => console.log(m.name));
        } else {
            console.log("No models returned:", data);
        }
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

testFetch();
