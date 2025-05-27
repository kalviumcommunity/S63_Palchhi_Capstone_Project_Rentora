const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  rating: { type: Number, required: true, min: 1, max: 5 },
  feedbackType: { 
    type: String, 
    required: true,
    enum: ['general', 'bug', 'suggestion', 'compliment']
  },
  comments: { type: String, required: true },
  screenshot: {
    filename: String,
    path: String,
    mimetype: String
  },
  name: { type: String },
  email: { type: String },
  privacyAgreed: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
