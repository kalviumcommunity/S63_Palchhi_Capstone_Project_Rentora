const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,  
  getMyListings   
} = require('../controllers/listingController');

const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadListingMedia, uploadMultipleToCloudinary } = require('../config/cloudinary');

const uploadFields = uploadListingMedia.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 3 }
]);

// Public routes
router.get('/', getAllListings);
router.get('/:id', getListingById);

// Protected routes
router.post('/', 
  protect, 
  uploadFields, 
  createListing
);

router.put('/:id', 
  protect, 
  authorize(['seller', 'admin']),
  uploadFields,
  updateListing
);

router.delete('/:id', 
  protect, 
  authorize(['seller', 'admin']),
  deleteListing
);

router.get('/my-listings', 
  protect, 
  getMyListings
);

router.post('/upload-media',
  protect,
  uploadFields,
  async (req, res) => {
    try {
      const files = {
        images: [],
        videos: []
      };
      
      // Upload images to Cloudinary
      if (req.files && req.files.images) {
        const imageResults = await uploadMultipleToCloudinary(req.files.images, 'rentora/listing-images');
        files.images = imageResults.map(result => result.secure_url);
        console.log('Image files uploaded to Cloudinary:', files.images);
      }
      
      // Upload videos to Cloudinary
      if (req.files && req.files.videos) {
        const videoResults = await uploadMultipleToCloudinary(req.files.videos, 'rentora/listing-videos');
        files.videos = videoResults.map(result => result.secure_url);
        console.log('Video files uploaded to Cloudinary:', files.videos);
      }
      
      res.status(200).json({
        success: true,
        data: files
      });
    } catch (error) {
      console.error('Error uploading files to Cloudinary:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading files',
        error: error.message
      });
    }
  }
);

module.exports = router;