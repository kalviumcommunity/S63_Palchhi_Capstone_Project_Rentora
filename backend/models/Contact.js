const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  propertyInterest: { 
    type: String, 
    enum: ['buy', 'rent', 'sell', 'other'],
    default: 'buy'
  },
  budget: { type: String },
  preferredLocation: { type: String, required: true },
  isDone: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['new', 'in-progress', 'completed', 'cancelled'],
    default: 'new'
  },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
