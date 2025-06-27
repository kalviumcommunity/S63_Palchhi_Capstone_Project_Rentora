const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  getCurrentUser,
  deleteUser,
  updateUserPreferences
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadProfileImage } = require('../config/cloudinary');

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected Routes
router.get('/me', protect, getCurrentUser);
router.get('/users', protect, authorize(['admin']), getAllUsers);
router.get('/users/:id', protect, getUserById);
router.put('/users/:id', protect, uploadProfileImage.single('profileImage'), updateUser);
router.put('/users/:id/preferences', protect, updateUserPreferences);
router.delete('/users/:id', 
  protect, 
  authorize(['admin']), 
  deleteUser
);

module.exports = router;
