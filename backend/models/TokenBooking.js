const mongoose = require('mongoose');

const tokenBookingSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tokenAmount: {
      type: Number,
      required: true,
      min: 0
    },
    totalPropertyValue: {
      type: Number,
      required: true,
      min: 0
    },
    bookingType: {
      type: String,
      enum: ['rent', 'sale'],
      required: true
    },
    duration: {
      type: Number, // For rent: number of months, For sale: not applicable
      min: 1
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
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
    paymentMethod: {
      type: String,
      enum: ['online', 'cash', 'bank_transfer'],
      required: true
    },
    paymentProof: {
      type: String // URL to payment proof document/image
    },
    agreementStatus: {
      type: String,
      enum: ['pending', 'signed', 'rejected'],
      default: 'pending'
    },
    agreementDocument: {
      type: String // URL to signed agreement document
    },
    validUntil: {
      type: Date,
      required: true
    },
    cancellationReason: {
      type: String
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster queries
tokenBookingSchema.index({ property: 1, status: 1 });
tokenBookingSchema.index({ buyer: 1, status: 1 });
tokenBookingSchema.index({ seller: 1, status: 1 });
tokenBookingSchema.index({ validUntil: 1 }, { expireAfterSeconds: 0 }); // TTL index for automatic cleanup

module.exports = mongoose.model('TokenBooking', tokenBookingSchema); 