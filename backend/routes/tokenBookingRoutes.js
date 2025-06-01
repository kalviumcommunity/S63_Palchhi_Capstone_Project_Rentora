const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const {
  getUserTokenBookings,
  getTokenBooking,
  createTokenBooking,
  updateTokenBookingStatus,
  cancelTokenBooking,
  uploadPaymentProof
} = require('../controllers/tokenBookingController');

// Apply authentication middleware to all routes
router.use(protect);

// Get user's token bookings
router.get('/my-bookings', getUserTokenBookings);

// Routes
router.route('/')
  .get(getUserTokenBookings)
  .post(createTokenBooking);

router.route('/:id')
  .get(getTokenBooking)
  .put(updateTokenBookingStatus)
  .delete(cancelTokenBooking);

// Cancel booking route
router.post('/:id/cancel', cancelTokenBooking);

// Payment proof upload route with file upload middleware
router.post(
  '/:bookingId/payment-proof',
  upload.single('paymentProof'),
  uploadPaymentProof
);

module.exports = router;