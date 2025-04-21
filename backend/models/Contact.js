const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  isDone: { type: Boolean, default: false } // 👈 new field
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
