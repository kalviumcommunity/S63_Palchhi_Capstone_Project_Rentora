const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentId: {
      type: String
    },
    numberOfGuests: {
      type: Number,
      required: true,
      min: 1
    },
    specialRequests: {
      type: String
    },
    cancellationReason: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
bookingSchema.index({ property: 1, user: 1 });
bookingSchema.index({ status: 1, paymentStatus: 1 });

module.exports = mongoose.model('Booking', bookingSchema); 