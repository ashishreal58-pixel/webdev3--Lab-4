const express = require('express');
const { getProfile, getAllUsers } = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', authenticate, getProfile);
router.get('/admin/users', authenticate, authorize('admin'), getAllUsers);

module.exports = router;
