const express = require('express');
const router = express.Router();
const { proxyGoogleImage } = require('../controllers/proxyController');

// Route to proxy Google profile images
router.get('/google-image', proxyGoogleImage);

module.exports = router;