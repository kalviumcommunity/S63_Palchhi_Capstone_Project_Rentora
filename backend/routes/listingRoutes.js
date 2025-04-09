const express = require('express');
const router = express.Router();
const {
  createListing,
  getAllListings,
  getListingById
} = require('../controllers/listingController');

// Create a new listing
router.post('/listings', createListing);

// Get all listings
router.get('/listings', getAllListings);

// Get a single listing by ID
router.get('/listings/:id', getListingById);

module.exports = router;
