const { parseIntent } = require("../services/intentService");
const Task = require("../models/Task");

// Fonction pour normaliser le titre de la tâche (Capitaliser chaque mot)
const normalizeTitle = (title) => {
    return title
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
};

const chatbotInteract = async (req, res) => {
    try {
        const { prompt } = req.body;

        // Analyse de l'intention utilisateur
        const parsed = await parseIntent(prompt);
        console.log("Parsed Response:", parsed);

        // Vérification de l'intention
        if (!parsed.intent) {
            return res.json({
                message: "Désolé, je n'ai pas compris votre demande. Voulez-vous créer, mettre à jour, lister ou supprimer une tâche ?",
            });
        }

        const { intent, details } = parsed;

        // Vérifier si l'intention est bien reconnue
        console.log("Intent détecté :", intent);

        switch (intent) {
            case "Créer une tâche":
            case "create_task":
                // Normaliser le titre de la tâche
                const normalizedTitle = normalizeTitle(details.title);

                // Création de la tâche
                const task = await Task.create({
                    title: normalizedTitle || "Nouvelle tâche",
                    description: details.description || "",
                    priority: details.priority || "Medium",
                    dueDate: details.dueDate ? new Date(details.dueDate) : null,
                    status: details.status || "Pending",
                    userId: req.user.id,
                });
                return res.json({ message: "Tâche créée avec succès.", task });

            case "Mettre à jour une tâche":
            case "update_task":
                // Normaliser le titre de la tâche
                const titleToUpdate = normalizeTitle(details.title);

                // Rechercher la tâche par titre normalisé
                const taskToUpdate = await Task.findOne({
                    title: titleToUpdate,
                    userId: req.user.id
                });

                if (!taskToUpdate) {
                    return res.status(404).json({ message: "Tâche introuvable." });
                }

                // Mettre à jour la tâche
                taskToUpdate.description = details.description || taskToUpdate.description;
                taskToUpdate.priority = details.priority || taskToUpdate.priority;
                taskToUpdate.dueDate = details.dueDate ? new Date(details.dueDate) : taskToUpdate.dueDate;
                taskToUpdate.status = details.status || taskToUpdate.status;

                const updatedTask = await taskToUpdate.save();

                return res.json({ message: "Tâche mise à jour.", updatedTask });

            case "Supprimer une tâche":
            case "delete_task":
                // Normaliser le titre de la tâche
                const titleToDelete = normalizeTitle(details.title);

                // Rechercher et supprimer la tâche par titre normalisé
                const taskToDelete = await Task.findOneAndDelete({
                    title: titleToDelete,
                    userId: req.user.id,
                });

                if (!taskToDelete) {
                    return res.status(404).json({ message: "Tâche introuvable." });
                }

                return res.json({ message: "Tâche supprimée avec succès." });

            case "Supprimer les tâches complétées":
            case "delete_completed_tasks":
                // Supprimer toutes les tâches avec le statut "Completed"
                const deletedTasks = await Task.deleteMany({
                    status: "Completed",
                    userId: req.user.id,
                });

                if (deletedTasks.deletedCount === 0) {
                    return res.json({ message: "Aucune tâche complétée à supprimer." });
                }

                return res.json({ message: `Toutes les tâches complétées ont été supprimées.` });

            default:
                // Log en cas d'intention non reconnue
                console.log("Intention non reconnue :", intent);
                return res.status(400).json({
                    message: "Désolé, je n'ai pas compris votre demande. Essayez à nouveau.",
                });
        }
    } catch (error) {
        console.error("Erreur :", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { chatbotInteract };
