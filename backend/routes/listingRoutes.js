const express = require('express');
const router = express.Router();
const {
  createListing,
  getAllListings,
  getListingById,
  updateListing  
} = require('../controllers/listingController');

const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

router.post('/listings', authMiddleware, authorizeRoles('seller', 'admin'), createListing);
router.put('/listings/:id', authMiddleware, authorizeRoles('seller', 'admin'), updateListing);

router.get('/listings', getAllListings);
router.get('/listings/:id', getListingById);

module.exports = router;
