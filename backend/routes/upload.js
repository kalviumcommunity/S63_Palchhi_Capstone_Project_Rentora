
const express = require('express');
const router = express.Router();
const { uploadImages } = require('../controllers/uploadController');
const upload = require('../middleware/upload');

// Route for uploading images
router.post('/', upload.array('images', 10), uploadImages);

module.exports = router;