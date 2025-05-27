const Feedback = require('../models/Feedback');
const multer = require('multer');
const path = require('path');

// Configure file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Initialize upload middleware
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
}).single('screenshot');

const handleFileUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

const submitFeedback = async (req, res) => {
  try {
    const { rating, feedbackType, comments, name, email, privacyAgreed } = req.body;
    
    // Validate required fields
    if (!privacyAgreed || !comments) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Prepare screenshot data
    const screenshot = req.file ? {
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype
    } : null;

    // Create new feedback
    const feedback = new Feedback({
      rating,
      feedbackType,
      comments,
      screenshot,
      name,
      email,
      privacyAgreed
    });

    await feedback.save();
    
    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  submitFeedback,
  getFeedbacks,
  handleFileUpload
};
