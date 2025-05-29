const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

// Create a new booking
router.post('/', protect, bookingController.createBooking);

// Get user's bookings
router.get('/my-bookings', protect, bookingController.getUserBookings);

// Get booking details
router.get('/:id', protect, bookingController.getBookingDetails);

// Cancel booking
router.post('/:id/cancel', protect, bookingController.cancelBooking);

// Update booking status (admin only)
router.patch('/:id/status', protect, authorize('admin'), bookingController.updateBookingStatus);

module.exports = router; 