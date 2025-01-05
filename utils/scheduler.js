const schedule = require('node-schedule');
const Task = require('../models/Task');
const sendBrevoEmail = require('./brevo');

const scheduleReminders = () => {
    // Planifier une tâche tous les jours à minuit
    schedule.scheduleJob('0 0 * * *', async () => {
        console.log('Vérification des rappels...');

        const today = new Date();
        const twoDaysLater = new Date();
        twoDaysLater.setDate(today.getDate() + 2);

        try {
            // Récupérer les tâches proches de leur échéance
            const tasks = await Task.find({
                dueDate: { $gte: today, $lte: twoDaysLater },
                status: { $ne: 'Completed' },
            }).populate('userId', 'email name');

            for (const task of tasks) {
                const subject = `Rappel : Votre tâche "${task.title}" est proche de son échéance`;
                const htmlContent = `
          <p>Bonjour ${task.userId.name},</p>
          <p>Votre tâche <strong>"${task.title}"</strong> arrive bientôt à échéance : ${new Date(task.dueDate).toLocaleDateString()}.</p>
          <p>Pensez à la compléter à temps !</p>
          <p>Merci,</p>
          <p>L'équipe de gestion des tâches</p>
        `;

                await sendBrevoEmail(task.userId.email, subject, htmlContent);
                console.log(`Rappel envoyé pour la tâche : ${task.title}`);
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi des rappels :', error.message);
        }
    });
};

module.exports = { scheduleReminders };
