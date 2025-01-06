const { generateResponse } = require("./geminiService");

const parseIntent = async (prompt) => {
    const intentPrompt = `
        L'utilisateur a écrit : "${prompt}".
        L'intention de l'utilisateur est liée à la gestion des tâches. Identifie l'intention principale parmi les suivantes :
        - Créer une tâche
        - Mettre à jour une tâche
        - Supprimer une tâche
        - Supprimer les tâches complétées

        Si l'intention est de créer ou de mettre à jour une tâche, précise les informations suivantes :
        - Titre de la tâche
        - Description (facultatif)
        - Priorité (facultatif, "Low", "Medium", "High")
        - Date limite (facultatif, format "YYYY-MM-DD" ou une date relative comme "demain", "la semaine prochaine", "dans 5 jours", etc.)
        - Statut de la tâche (facultatif, "Pending", "Ongoing", "Completed")
        - Si la date limite est mentionnée sous forme relative (ex. "demain", "semaine prochaine"), convertis-la en une date précise au format "YYYY-MM-DD".

        Si l'intention est de supprimer une tâche, précise le titre de la tâche. Si l'intention est de supprimer toutes les tâches complétées, aucune information supplémentaire n'est nécessaire.

        Retourne ces informations sous forme de JSON avec les clés suivantes :
        {
            "intent": "string",
            "details": {
                "title": "string (facultatif, si applicable)",
                "description": "string (facultatif)",
                "priority": "Low/Medium/High",
                "dueDate": "YYYY-MM-DD (ou une date relative convertie en date précise)",
                "status": "Pending/Ongoing/Completed",
                "id": "string (facultatif, si applicable)"
            }
        }
    `;

    try {
        const response = await generateResponse(intentPrompt);

        // Nettoyer la réponse pour supprimer les backticks ou tout texte markdown
        const cleanedResponse = response.replace(/^```json|```$/g, '').trim();

        // Maintenant, tenter de parser la réponse nettoyée
        const parsedResponse = JSON.parse(cleanedResponse);

        return parsedResponse;
    } catch (error) {
        console.error("Erreur lors du nettoyage ou du parsing:", error.message);
        throw new Error("Impossible d'analyser la réponse de l'IA.");
    }
};

module.exports = { parseIntent };
