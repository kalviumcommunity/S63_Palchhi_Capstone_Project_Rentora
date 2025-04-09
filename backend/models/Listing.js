const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String },
      pincode: { type: String },
    },
    propertyType: { type: String,  enum: ['rent', 'sale'],  required: true, },

    bedrooms: { type: Number, required: true, },

    bathrooms: { type: Number, required: true, },

    squareFeet: { type: Number,},

    images: [
      {
        type: String, // URL to image stored in cloud or server
      },
    ],
    isAvailable: { type: Boolean, default: true,},

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Listing', listingSchema);
