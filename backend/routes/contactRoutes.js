const express = require('express');
const router = express.Router();
const {
  submitContactForm,
  getAllContacts,
  markContactAsDone,
  updateContactStatus,
  deleteContact
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/authMiddleware');


router.post('/', submitContactForm);                


router.get('/', protect, authorize(['admin', 'seller']), getAllContacts);  
router.put('/:id/done', protect, authorize(['admin', 'seller']), markContactAsDone);  
router.put('/:id/status', protect, authorize(['admin', 'seller']), updateContactStatus);  
router.delete('/:id', protect, authorize(['admin']), deleteContact);  

module.exports = router;
