const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
// Servir les fichiers statiques du dossier "uploads"
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const { scheduleReminders } = require("./utils/scheduler");
scheduleReminders(); // Démarrer les jobs planifiés



// Connexion à MongoDB
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connecté'))
    .catch((err) => console.error('Erreur de connexion à MongoDB:', err));

// Import des routes
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
