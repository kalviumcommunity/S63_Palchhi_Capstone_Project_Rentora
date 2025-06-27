const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadPaymentProof: cloudinaryUploadPaymentProof } = require('../config/cloudinary');
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

// Payment proof upload route with Cloudinary middleware
router.post(
  '/:bookingId/payment-proof',
  cloudinaryUploadPaymentProof.single('paymentProof'),
  uploadPaymentProof
);

module.exports = router;