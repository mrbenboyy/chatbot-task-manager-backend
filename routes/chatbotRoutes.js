const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { chatbotInteract } = require('../controllers/chatbotController');
const router = express.Router();

router.post('/', protect, chatbotInteract);

module.exports = router;
