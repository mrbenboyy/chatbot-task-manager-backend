const { GoogleGenerativeAI } = require("@google/generative-ai");
const Task = require('../models/Task');

// Initialisation de l'API Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Fonction utilitaire pour nettoyer et normaliser les textes
const normalizeText = (text) => text.trim().toLowerCase();

const interactWithChatbot = async (req, res) => {
    try {
        const userMessage = req.body.message;

        if (!userMessage) {
            return res.status(400).json({ message: 'Message utilisateur requis.' });
        }

        // Appel au modèle Gemini
        const geminiResult = await model.generateContent(userMessage);
        const botResponse = geminiResult.response.text()?.trim();

        if (!botResponse) {
            return res.status(500).json({ message: "Erreur dans la réponse du chatbot." });
        }

        console.log('Réponse initiale de Gemini:', botResponse);

        // Commande : Ajouter une tâche
        if (/ajoute une tâche/i.test(userMessage)) {
            const taskDetails = userMessage.replace(/ajoute une tâche[:]*\s*/i, '').trim();
            if (taskDetails) {
                const newTask = new Task({
                    title: taskDetails,
                    description: 'Description par défaut',
                    dueDate: new Date(),
                    priority: 'Medium',
                    status: 'Ongoing',
                    userId: req.user.id,
                });
                await newTask.save();
                return res.status(200).json({ botResponse: `Tâche ajoutée : ${taskDetails}` });
            } else {
                return res.status(400).json({ botResponse: 'Détails de la tâche manquants.' });
            }
        }

        // Commande : Supprimer une tâche
        if (/supprime la tâche/i.test(userMessage)) {
            const taskTitle = userMessage.replace(/supprime la tâche[:]*\s*/i, '').trim();
            const deletedTask = await Task.findOneAndDelete({
                title: { $regex: new RegExp(`^${normalizeText(taskTitle)}$`, 'i') },
                userId: req.user.id,
            });
            return res.status(200).json({
                botResponse: deletedTask
                    ? `Tâche supprimée : ${taskTitle}`
                    : `Tâche introuvable pour suppression : ${taskTitle}`,
            });
        }

        // Commande : Modifier une tâche
        const matchStatus = userMessage.match(/modifie la tâche\s*(.*?)\s*en ajoutant\s*un statut\s*[:\s]*\s*(Ongoing|Completed|Pending)/i);
        const matchDescription = userMessage.match(/modifie la tâche\s*(.*?)\s*en ajoutant\s*une description\s*[:\s]*\s*(.+)/i);
        const matchPriority = userMessage.match(/modifie la tâche\s*(.*?)\s*en ajoutant\s*une priorité\s*[:\s]*\s*(Low|Medium|High)/i);
        const matchDueDate = userMessage.match(/modifie la tâche\s*(.*?)\s*en ajoutant\s*une date d'échéance\s*[:\s]*\s*(\d{4}-\d{2}-\d{2})/i);

        let task, taskTitle;

        // Modification du statut
        if (matchStatus && matchStatus.length === 3) {
            taskTitle = normalizeText(matchStatus[1]);
            const newStatus = matchStatus[2];

            task = await Task.findOne({
                title: { $regex: new RegExp(`^${taskTitle}$`, 'i') },
                userId: req.user.id,
            });

            if (!task) {
                return res.status(404).json({ botResponse: `Tâche introuvable : ${taskTitle}.` });
            }

            task.status = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
            await task.save();

            return res.status(200).json({
                botResponse: `Tâche modifiée : ${task.title} avec le nouveau statut : ${task.status}.`,
            });
        }

        // Modification de la description
        if (matchDescription && matchDescription.length === 3) {
            taskTitle = normalizeText(matchDescription[1]);
            const newDescription = matchDescription[2];

            task = await Task.findOne({
                title: { $regex: new RegExp(`^${taskTitle}$`, 'i') },
                userId: req.user.id,
            });

            if (!task) {
                return res.status(404).json({ botResponse: `Tâche introuvable : ${taskTitle}.` });
            }

            task.description = newDescription;
            await task.save();

            return res.status(200).json({
                botResponse: `Tâche modifiée : ${task.title} avec la nouvelle description : ${task.description}.`,
            });
        }

        // Modification de la priorité
        if (matchPriority && matchPriority.length === 3) {
            taskTitle = normalizeText(matchPriority[1]);
            const newPriority = matchPriority[2];

            task = await Task.findOne({
                title: { $regex: new RegExp(`^${taskTitle}$`, 'i') },
                userId: req.user.id,
            });

            if (!task) {
                return res.status(404).json({ botResponse: `Tâche introuvable : ${taskTitle}.` });
            }

            task.priority = newPriority;
            await task.save();

            return res.status(200).json({
                botResponse: `Tâche modifiée : ${task.title} avec la nouvelle priorité : ${task.priority}.`,
            });
        }

        // Modification de la date d'échéance
        if (matchDueDate && matchDueDate.length === 3) {
            taskTitle = normalizeText(matchDueDate[1]);
            const newDueDate = new Date(matchDueDate[2]);

            task = await Task.findOne({
                title: { $regex: new RegExp(`^${taskTitle}$`, 'i') },
                userId: req.user.id,
            });

            if (!task) {
                return res.status(404).json({ botResponse: `Tâche introuvable : ${taskTitle}.` });
            }

            task.dueDate = newDueDate;
            await task.save();

            return res.status(200).json({
                botResponse: `Tâche modifiée : ${task.title} avec la nouvelle date d'échéance : ${newDueDate.toISOString().split('T')[0]}.`,
            });
        }

        // Commande : Lister les tâches
        if (/liste mes tâches/i.test(userMessage)) {
            const tasks = await Task.find({ userId: req.user.id });
            const taskList = tasks.length ? tasks.map((task) => task.title).join(', ') : "Aucune tâche à afficher.";
            return res.status(200).json({ botResponse: `Voici vos tâches : ${taskList}` });
        }

        // Commande : Supprimer les tâches complétées
        if (/supprime les tâches complétées/i.test(userMessage)) {
            const deletedTasks = await Task.deleteMany({ status: "Completed", userId: req.user.id });
            return res.status(200).json({
                botResponse: deletedTasks.deletedCount > 0
                    ? `${deletedTasks.deletedCount} tâches complétées supprimées.`
                    : "Aucune tâche complétée à supprimer.",
            });
        }

        if (/suggestions pour organiser les priorités/i.test(userMessage)) {
            const now = new Date();
            const userId = req.user.id;

            // Récupérer les tâches de l'utilisateur
            const tasks = await Task.find({ userId });

            // Filtrer les tâches par priorité
            const mediumPriorityTasks = tasks.filter(task => task.priority === "Medium");

            // Filtrer les tâches dont la date d'échéance est proche (dans 2 jours)
            const upcomingTasks = tasks.filter(task => {
                const diffInDays = (new Date(task.dueDate) - now) / (1000 * 60 * 60 * 24);
                return diffInDays <= 2 && diffInDays >= 0 && task.status !== "Completed";
            });

            // Filtrer les tâches en retard
            const overdueTasks = tasks.filter(task => new Date(task.dueDate) < now && task.status !== "Completed");

            // Construction de la réponse
            let suggestions = [];

            // Suggestion pour les tâches avec une priorité Medium
            if (mediumPriorityTasks.length > 0) {
                suggestions.push(`Vous avez ${mediumPriorityTasks.length} tâches avec une priorité 'Medium'. Voulez-vous les reclasser ?`);
            }

            // Suggestion pour les tâches à échéance proche
            if (upcomingTasks.length > 0) {
                const upcomingTitles = upcomingTasks.map(task => task.title).join(', ');
                suggestions.push(`Les tâches suivantes sont dues bientôt : ${upcomingTitles}. Pensez à les prioriser.`);
            }

            // Suggestion pour les tâches en retard
            if (overdueTasks.length > 0) {
                const overdueTitles = overdueTasks.map(task => task.title).join(', ');
                suggestions.push(`Les tâches suivantes sont en retard : ${overdueTitles}. Voulez-vous les reprogrammer ?`);
            }

            // Si aucune suggestion n'est pertinente
            if (suggestions.length === 0) {
                return res.status(200).json({ botResponse: "Aucune suggestion pour le moment." });
            }

            // Retourner les suggestions
            return res.status(200).json({ botResponse: suggestions.join(' ') });
        }

        // Si aucune commande spécifique n'est reconnue, retourne la réponse générée par Gemini
        return res.status(200).json({ botResponse });
    } catch (error) {
        console.error('Erreur avec Gemini:', error.message, error);
        res.status(500).json({ message: 'Erreur du serveur ou du chatbot.' });
    }
};

module.exports = { interactWithChatbot };