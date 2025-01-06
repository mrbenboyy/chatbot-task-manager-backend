const { GoogleGenerativeAI } = require("@google/generative-ai");

const geminiAPIKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(geminiAPIKey);

const generateResponse = async (prompt) => {
    try {
        // Initialisez le modèle
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(prompt);

        // Récupérez et retournez le texte généré
        const rawReply = result.response.text();
        console.log("Raw Reply from Gemini:", rawReply);

        return rawReply.trim(); // Nettoyez le texte de la réponse
    } catch (error) {
        console.error("Erreur lors de l'appel à Gemini:", error.message);
        throw new Error("Impossible de générer une réponse.");
    }
};

module.exports = { generateResponse };
