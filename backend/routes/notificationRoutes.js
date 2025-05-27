const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} = require('../controllers/notificationController');


router.use(protect);


router.get('/', getUserNotifications);


router.get('/unread-count', getUnreadCount);

router.put('/:notificationId/read', markAsRead);


router.put('/mark-all-read', markAllAsRead);


router.delete('/:notificationId', deleteNotification);

module.exports = router;