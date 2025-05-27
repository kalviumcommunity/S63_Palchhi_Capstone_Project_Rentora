const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: [
        'new_message',
        'listing_review',
        'listing_interest',
        'price_change',
        'system_notification',
        'listing_approved',
        'listing_rejected',
        'account_update'
      ],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    relatedListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing'
    },
    relatedReview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    },
    read: {
      type: Boolean,
      default: false
    },
    actionLink: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);