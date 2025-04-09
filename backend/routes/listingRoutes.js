const express = require('express');
const router = express.Router();
const {
  createListing,
  getAllListings,
  getListingById,
  updateListing  
} = require('../controllers/listingController');

router.post('/listings', createListing);
router.get('/listings', getAllListings);
router.get('/listings/:id', getListingById);

router.put('/listings/:id', updateListing); 
module.exports = router;
