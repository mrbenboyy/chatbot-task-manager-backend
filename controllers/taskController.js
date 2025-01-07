const Task = require('../models/Task');

const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.id });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTaskById = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
        if (!task) {
            return res.status(404).json({ message: 'Tâche introuvable.' });
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const createTask = async (req, res) => {
    const { title, description, dueDate, priority, status } = req.body;
    const currentDueDate = dueDate ? new Date(dueDate) : new Date();
    try {
        const task = await Task.create({
            title,
            description,
            dueDate: currentDueDate,
            priority,
            status,
            userId: req.user.id,
        });
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Fonction pour mettre à jour un seul attribut de la tâche
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, dueDate, priority, status } = req.body;

        // Créer un objet pour la mise à jour
        const updateFields = {};

        // Vérifier les champs à mettre à jour
        if (title) {
            updateFields.title = title; // Ajout du titre
        }
        if (description) {
            updateFields.description = description;
        }
        if (dueDate) {
            updateFields.dueDate = new Date(dueDate);
        }
        if (priority) {
            updateFields.priority = priority;
        }
        if (status) {
            // Vérifier que le statut est valide
            const validStatuses = ['Pending', 'Ongoing', 'Completed'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: `Statut invalide. Les statuts valides sont : ${validStatuses.join(", ")}.` });
            }
            updateFields.status = status;
        }

        // Mise à jour de la tâche
        const task = await Task.findOneAndUpdate(
            { _id: id, userId: req.user.id },
            updateFields,
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({ message: 'Tâche introuvable.' });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!task) {
            return res.status(404).json({ message: 'Tâche introuvable.' });
        }
        res.json({ message: 'Tâche supprimée avec succès.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteCompletedTasks = async (req, res) => {
    try {
        const result = await Task.deleteMany({ status: "Completed", userId: req.user.id });
        res.json({
            message: `${result.deletedCount} tâches complétées supprimées.`,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getTasks, createTask, getTaskById, updateTask, deleteTask, deleteCompletedTasks };
