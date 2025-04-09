const express = require('express');
const router = express.Router();
const { createListing } = require('../controllers/listingController');

router.post('/listings', createListing);

module.exports = router;
