const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  getCurrentUser
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);



// Protected Routes
router.get('/me', protect, getCurrentUser);
router.get('/users', protect, authorize(['admin']), getAllUsers);
router.get('/users/:id', protect, getUserById);
router.put('/users/:id', protect, updateUser);

module.exports = router;
