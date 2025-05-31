const TokenBooking = require('../models/TokenBooking');
const Listing = require('../models/Listing');
const User = require('../models/User');
const { validateTokenBooking } = require('../utils/validators');
const { ErrorHandler } = require('../utils/errorHandler');

// Create a new token booking
exports.createTokenBooking = async (req, res, next) => {
  try {
    const {
      propertyId,
      tokenAmount,
      bookingType,
      duration,
      paymentMethod,
      notes
    } = req.body;

    // Validate request data
    const { error } = validateTokenBooking(req.body);
    if (error) {
      return next(new ErrorHandler(error.details[0].message, 400));
    }

    // Get property details
    const property = await Listing.findById(propertyId);
    if (!property) {
      return next(new ErrorHandler('Property not found', 404));
    }

    // Check if user is trying to book their own property
    if (property.createdBy.toString() === req.user._id.toString()) {
      return next(new ErrorHandler('You cannot book your own property', 400));
    }

    // Check if property is available
    if (property.status !== 'available') {
      return next(new ErrorHandler('Property is not available for booking', 400));
    }

    // Calculate valid until date (7 days from now)
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 7);

    // Create token booking
    const tokenBooking = await TokenBooking.create({
      property: propertyId,
      buyer: req.user._id,
      seller: property.createdBy,
      tokenAmount,
      totalPropertyValue: property.price,
      bookingType,
      duration,
      paymentMethod,
      notes,
      validUntil
    });

    // Update property status
    property.status = 'token_booked';
    await property.save();

    res.status(201).json({
      success: true,
      data: tokenBooking
    });
  } catch (error) {
    next(error);
  }
};

// Get all token bookings for a user
exports.getUserTokenBookings = async (req, res, next) => {
  try {
    const bookings = await TokenBooking.find({
      $or: [{ buyer: req.user._id }, { seller: req.user._id }]
    })
      .populate('property', 'title images price location')
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// Get single token booking
exports.getTokenBooking = async (req, res, next) => {
  try {
    const booking = await TokenBooking.findById(req.params.id)
      .populate('property', 'title images price location')
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    if (!booking) {
      return next(new ErrorHandler('Token booking not found', 404));
    }

    // Check if user is authorized to view this booking
    if (
      booking.buyer._id.toString() !== req.user._id.toString() &&
      booking.seller._id.toString() !== req.user._id.toString()
    ) {
      return next(new ErrorHandler('Not authorized to view this booking', 403));
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// Update token booking status
exports.updateTokenBookingStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus, agreementStatus } = req.body;
    const booking = await TokenBooking.findById(req.params.id);

    if (!booking) {
      return next(new ErrorHandler('Token booking not found', 404));
    }

    // Check if user is authorized to update this booking
    if (booking.seller._id.toString() !== req.user._id.toString()) {
      return next(new ErrorHandler('Not authorized to update this booking', 403));
    }

    // Update status
    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (agreementStatus) booking.agreementStatus = agreementStatus;

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// Cancel token booking
exports.cancelTokenBooking = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;
    const booking = await TokenBooking.findById(req.params.id);

    if (!booking) {
      return next(new ErrorHandler('Token booking not found', 404));
    }

    // Check if user is authorized to cancel this booking
    if (
      booking.buyer._id.toString() !== req.user._id.toString() &&
      booking.seller._id.toString() !== req.user._id.toString()
    ) {
      return next(new ErrorHandler('Not authorized to cancel this booking', 403));
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason;
    await booking.save();

    // Update property status back to available
    const property = await Listing.findById(booking.property);
    property.status = 'available';
    await property.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// Upload payment proof
exports.uploadPaymentProof = async (req, res, next) => {
  try {
    const booking = await TokenBooking.findById(req.params.id);

    if (!booking) {
      return next(new ErrorHandler('Token booking not found', 404));
    }

    // Check if user is authorized to upload proof
    if (booking.buyer._id.toString() !== req.user._id.toString()) {
      return next(new ErrorHandler('Not authorized to upload payment proof', 403));
    }

    // Update payment proof with full URL path
    const baseUrl = process.env.BASE_URL || 'http://localhost:8000';
    const filePath = req.file.path.replace(/\\/g, '/'); // Convert Windows path to URL format
    const relativePath = filePath.split('public')[1]; // Get path relative to public directory
    booking.paymentProof = `${baseUrl}${relativePath}`;
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};