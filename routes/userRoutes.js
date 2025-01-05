const express = require('express');
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controllers/userController');
const upload = require('../middlewares/uploadMiddleware');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', upload.single('profileImage'), registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getUserProfile);
router.put('/update', protect, upload.single('profileImage'), updateUserProfile);

module.exports = router;
