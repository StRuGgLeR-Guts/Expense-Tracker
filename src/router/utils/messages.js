// Import Gemini model
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

async function getChatbotResponse(userMessage) {
    try {
        console.log("Generating AI financial advice...");

        const prompt = `
You are a helpful and unbiased AI finance assistant.

If the user's question is general (e.g. "how does inflation work", "what is budgeting"), provide a short and informative explanation.

If the user asks for **money-saving** tips, provide exactly 5 concise, numbered tips and reply in one or two sentences.

User Query: "${userMessage}"

Only respond appropriately based on the user's intent.
`.trim();


        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();

        return text || "Sorry, I couldn't generate a response.";

    } catch (error) {
        console.error("AI Chatbot error:", error);
        return "Sorry, I'm having trouble responding right now.";
    }
}

module.exports = { getChatbotResponse };
