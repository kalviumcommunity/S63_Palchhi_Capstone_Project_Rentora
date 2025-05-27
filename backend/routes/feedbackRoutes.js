const express = require('express');
const router = express.Router();
const { 
  submitFeedback, 
  getFeedbacks, 
  handleFileUpload 
} = require('../controllers/feedbackController');


router.post('/', handleFileUpload, submitFeedback);


router.get('/', getFeedbacks);

module.exports = router;
