const express = require('express');
const router = express.Router();
const {
  createListing,
  getAllListings,
  getListingById,
  updateListing  
} = require('../controllers/listingController');

const authMiddleware = require('../middleware/authMiddleware'); // ✅ Import middleware

// 🔐 Protected Routes
router.post('/listings', authMiddleware, createListing);
router.put('/listings/:id', authMiddleware, updateListing);

// 🌐 Public Routes
router.get('/listings', getAllListings);
router.get('/listings/:id', getListingById);

module.exports = router;
