const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const { createError } = require('../utils/error');

// Create a new booking
exports.createBooking = async (req, res, next) => {
  try {
    const {
      propertyId,
      startDate,
      endDate,
      numberOfGuests,
      specialRequests
    } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return next(createError(400, 'End date must be after start date'));
    }

    if (start < new Date()) {
      return next(createError(400, 'Cannot book for past dates'));
    }

    // Get property details
    const property = await Listing.findById(propertyId);
    if (!property) {
      return next(createError(404, 'Property not found'));
    }

    if (!property.isAvailable) {
      return next(createError(400, 'Property is not available for booking'));
    }

    // Check for existing bookings that overlap
    const existingBooking = await Booking.findOne({
      property: propertyId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start }
        }
      ]
    });

    if (existingBooking) {
      return next(createError(400, 'Property is already booked for these dates'));
    }

    // Calculate total amount
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalAmount = property.price * days;

    // Create booking
    const booking = new Booking({
      property: propertyId,
      user: req.user._id,
      startDate: start,
      endDate: end,
      totalAmount,
      numberOfGuests,
      specialRequests
    });

    await booking.save();

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// Get user's bookings
exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('property')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// Get booking details
exports.getBookingDetails = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('property')
      .populate('user', 'name email phone');

    if (!booking) {
      return next(createError(404, 'Booking not found'));
    }

    // Check if the user is authorized to view this booking
    if (booking.user._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return next(createError(403, 'Not authorized to view this booking'));
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// Cancel booking
exports.cancelBooking = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(createError(404, 'Booking not found'));
    }

    // Check if the user is authorized to cancel this booking
    if (booking.user.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return next(createError(403, 'Not authorized to cancel this booking'));
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return next(createError(400, 'Booking is already cancelled'));
    }

    if (booking.status === 'completed') {
      return next(createError(400, 'Cannot cancel a completed booking'));
    }

    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// Update booking status (admin only)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(createError(404, 'Booking not found'));
    }

    if (req.user.role !== 'admin') {
      return next(createError(403, 'Not authorized to update booking status'));
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
}; 