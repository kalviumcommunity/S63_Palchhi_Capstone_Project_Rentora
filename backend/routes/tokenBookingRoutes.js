const express = require('express');
const router = express.Router();
const {
  createTokenBooking,
  getUserTokenBookings,
  getTokenBooking,
  updateTokenBookingStatus,
  cancelTokenBooking,
  uploadPaymentProof
} = require('../controllers/tokenBookingController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Create a new token booking
router.post('/', protect, createTokenBooking);

// Get all token bookings for the logged-in user
router.get('/my-bookings', protect, getUserTokenBookings);

// Get a single token booking
router.get('/:id', protect, getTokenBooking);

// Update token booking status (seller only)
router.patch('/:id/status', protect, updateTokenBookingStatus);

// Cancel token booking
router.post('/:id/cancel', protect, cancelTokenBooking);

// Upload payment proof
router.post(
  '/:id/payment-proof',
  protect,
  upload.single('paymentProof'),
  uploadPaymentProof
);

module.exports = router;