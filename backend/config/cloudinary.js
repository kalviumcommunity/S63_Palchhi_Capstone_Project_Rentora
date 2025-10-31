const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary (if credentials are provided)
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
} else {
  console.warn('Cloudinary not configured. Falling back to local storage for uploads.');
}

// Create storage configurations for different types of uploads
const createCloudinaryStorage = (folder, allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp']) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: allowedFormats,
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' }, // Resize large images
        { quality: 'auto:good' } // Optimize quality
      ]
    }
  });
};

// Storage configurations for different upload types
const profileImageStorage = createCloudinaryStorage('rentora/profile-images');
const listingImageStorage = createCloudinaryStorage('rentora/listing-images');
const listingVideoStorage = createCloudinaryStorage('rentora/listing-videos', ['mp4', 'avi', 'mov', 'wmv']);
const paymentProofStorage = createCloudinaryStorage('rentora/payment-proofs', ['jpg', 'jpeg', 'png', 'pdf']);

// Multer upload configurations
const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const uploadListingMedia = multer({
  storage: multer.memoryStorage(), // Use memory storage for multiple files
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB for videos
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'images') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    } else if (file.fieldname === 'videos') {
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only video files are allowed!'), false);
      }
    } else {
      cb(null, false);
    }
  }
});

const uploadPaymentProof = multer({
  storage: paymentProofStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed!'), false);
    }
  }
});

// Utility functions for Cloudinary operations
const fs = require('fs');
const path = require('path');
const projectRoot = path.resolve(__dirname, '..');

const uploadToCloudinary = async (file, folder = 'rentora/misc') => {
  if (!isCloudinaryConfigured) {
    // Fallback: write buffer to disk and return an object mimicking Cloudinary's response
    try {
      const ext = file.originalname ? path.extname(file.originalname) : '.bin';
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const subfolder = folder.includes('video') ? 'videos' : 'images';
      const uploadDir = path.join(projectRoot, 'public', 'uploads', subfolder);
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const outPath = path.join(uploadDir, filename);

      // file.buffer is expected when using memoryStorage
      if (file.buffer) {
        fs.writeFileSync(outPath, file.buffer);
      } else if (file.path) {
        // If a file.path exists (disk storage), copy it
        fs.copyFileSync(file.path, outPath);
      } else {
        throw new Error('No file buffer or path available for local fallback');
      }

      return {
        secure_url: `/uploads/${subfolder}/${filename}`,
        public_id: `${folder}/${filename}`
      };
    } catch (err) {
      console.error('Local fallback upload error:', err);
      throw new Error('Failed to save file to local storage');
    }
  }

  // If Cloudinary is configured, use it
  try {
    // If file.buffer is present, convert to a data URI string for cloudinary
    if (file.buffer) {
      const dataUriPrefix = `data:${file.mimetype || 'application/octet-stream'};base64,`;
      const base64 = file.buffer.toString('base64');
      const dataUri = dataUriPrefix + base64;
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: folder,
        resource_type: 'auto',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto:good' }
        ]
      });
      return result;
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

const uploadMultipleToCloudinary = async (files, folder = 'rentora/misc') => {
  try {
    const uploadPromises = files.map(file => uploadToCloudinary(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Multiple Cloudinary upload error:', error);
    throw new Error('Failed to upload files to Cloudinary');
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
};

const getCloudinaryUrl = (publicId, options = {}) => {
  const defaultOptions = {
    width: 800,
    height: 600,
    crop: 'fill',
    quality: 'auto:good'
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  return cloudinary.url(publicId, finalOptions);
};

module.exports = {
  cloudinary,
  uploadProfileImage,
  uploadListingMedia,
  uploadPaymentProof,
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
  getCloudinaryUrl
}; 