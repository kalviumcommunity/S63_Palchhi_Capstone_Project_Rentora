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


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use consistent path for uploads
    let uploadPath = path.join(__dirname, '..', 'public', 'uploads');
    
    if (file.fieldname === 'images') {
      uploadPath = path.join(uploadPath, 'images');
    } else if (file.fieldname === 'videos') {
      uploadPath = path.join(uploadPath, 'videos');
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    console.log('Upload path:', uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'images') {

    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  } else if (file.fieldname === 'videos') {
    // Accept only video files
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  } else {
    cb(null, false);
  }
};


const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for videos
});

const uploadFields = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 3 }
]);

router.get('/listings', getAllListings);
router.get('/listings/:id', getListingById);

router.post('/listings', 
  protect, 
  uploadFields, 
  createListing
);

router.put('/listings/:id', 
  protect, 
  authorize(['seller', 'admin']),
  uploadFields,
  updateListing
);


router.delete('/listings/:id', 
  protect, 
  authorize(['seller', 'admin']),
  deleteListing
);

router.get('/my-listings', 
  protect, 
  getMyListings
);


router.post('/listings/upload-media',
  protect,
  uploadFields,
  (req, res) => {
    try {
      const files = {
        images: [],
        videos: []
      };
      
      
      if (req.files && req.files.images) {
        files.images = req.files.images.map(file => `/uploads/images/${file.filename}`);
        console.log('Image files uploaded:', files.images);
      }
      
      
      if (req.files && req.files.videos) {
        files.videos = req.files.videos.map(file => `/uploads/videos/${file.filename}`);
        console.log('Video files uploaded:', files.videos);
      }
      
      res.status(200).json({
        success: true,
        data: files
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error uploading files',
        error: error.message
      });
    }
  }
);

module.exports = router;