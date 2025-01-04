const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { interactWithChatbot } = require('../controllers/chatbotController');
const router = express.Router();

// Appliquer le middleware 'protect' avant d'appeler le contrôleur interactWithChatbot
router.post('/', protect, interactWithChatbot);

module.exports = router;
