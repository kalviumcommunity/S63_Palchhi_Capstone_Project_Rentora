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


router.get('/chats', protect, getUserChats);

router.get('/chats/:id', protect, getChatById);


router.post('/chats', protect, createChat);

router.post('/chats/message', protect, sendMessage);


router.put('/chats/:chatId/read', protect, markMessagesAsRead);


router.delete('/chats/:chatId', protect, deleteChat);

module.exports = router;