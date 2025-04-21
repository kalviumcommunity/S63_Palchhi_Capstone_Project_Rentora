const express = require('express');
const router = express.Router();
const {
  submitContactForm,
  getAllContacts,
  markContactAsDone
} = require('../controllers/contactController');

router.post('/', submitContactForm);                // Contact form submit
router.get('/', getAllContacts);                    // Get all contacts
router.put('/:id/done', markContactAsDone);         // Mark contact as done

module.exports = router;
