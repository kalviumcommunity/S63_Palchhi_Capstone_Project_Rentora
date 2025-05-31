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
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      }
    },
    propertyType: {
      type: String,
      enum: ['rent', 'sale'],
      required: true,
    },
    buildingType: {
      type: String,
      enum: ['apartment', 'house', 'villa', 'penthouse', 'townhouse', 'land', 'commercial', 'other'],
      default: 'apartment'
    },
    bedrooms: {
      type: Number,
      required: true,
    },
    bathrooms: {
      type: Number,
      required: true,
    },
    squareFeet: {
      type: Number,
    },
    images: [
      {
        type: String,
      },
    ],
    videos: [
      {
        type: String,
      }
    ],
    features: [String],
    amenities: {
      furnished: { type: Boolean, default: false },
      airConditioning: { type: Boolean, default: false },
      parking: { type: Boolean, default: false },
      gym: { type: Boolean, default: false },
      swimmingPool: { type: Boolean, default: false },
      internet: { type: Boolean, default: false },
      petFriendly: { type: Boolean, default: false },
      garden: { type: Boolean, default: false },
      security: { type: Boolean, default: false },
      balcony: { type: Boolean, default: false },
      elevator: { type: Boolean, default: false },
      wheelchairAccess: { type: Boolean, default: false }
    },
    isAvailable: {
      type: Boolean,
      default: true,
      required: true
    },
    status: {
      type: String,
      enum: ['available', 'token_booked', 'sold', 'rented', 'unavailable'],
      default: 'available'
    },
    isPremium: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    viewCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
  }
);

// Add a pre-save middleware to ensure isAvailable is set based on status
listingSchema.pre('save', function(next) {
  if (this.status === 'available') {
    this.isAvailable = true;
  } else {
    this.isAvailable = false;
  }
  next();
});

module.exports = mongoose.model('Listing', listingSchema);
