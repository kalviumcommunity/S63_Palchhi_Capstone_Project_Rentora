const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const {
  createListing,
  getAllListings,
  getListing,
  updateListing,
  deleteListing
} = require('../controllers/listingController');

const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

router.post('/', protect, upload.array('images', 10), createListing);
router.put('/:id', protect, upload.array('images', 10), updateListing);
router.delete('/:id', protect, deleteListing);

router.get('/', getAllListings);
router.get('/:id', getListing);

module.exports = router;
