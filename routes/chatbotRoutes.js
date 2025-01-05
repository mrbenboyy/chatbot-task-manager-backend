const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { interactWithChatbot } = require('../controllers/chatbotController');
const router = express.Router();

router.post('/', protect, interactWithChatbot);

module.exports = router;
