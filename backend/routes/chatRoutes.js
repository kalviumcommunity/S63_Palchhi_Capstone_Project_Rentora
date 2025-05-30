const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUserChats,
  getChatById,
  createChat,
  sendMessage,
  markMessagesAsRead,
  deleteChat
} = require('../controllers/chatController');

// Get all chats for the current user
router.get('/chats', protect, getUserChats);

// Get a specific chat by ID
router.get('/chats/:id', protect, getChatById);

// Create a new chat
router.post('/chats', protect, createChat);

// Send a message in a chat
router.post('/chats/:chatId/messages', protect, sendMessage);

// Mark messages as read in a chat
router.put('/chats/:chatId/read', protect, markMessagesAsRead);

// Delete a chat
router.delete('/chats/:chatId', protect, deleteChat);

module.exports = router;