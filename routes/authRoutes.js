const express = require('express');
const router = express.Router();

const { signup, login, getProfile, updateProfile } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware'); 

// রাউটগুলো
router.post('/signup', signup);
router.post('/login', login);

// প্রোফাইলের জন্য রাউটগুলো
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// 🟢 এই লাইনটা মিসিং থাকার কারণেই সার্ভার ক্র্যাশ করছিল!
module.exports = router;