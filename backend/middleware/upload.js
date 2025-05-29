// File: middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Get the absolute path to the project root
const projectRoot = path.resolve(__dirname, '..');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    path.join(projectRoot, 'public'),
    path.join(projectRoot, 'public', 'uploads'),
    path.join(projectRoot, 'public', 'uploads', 'profile-images'),
    path.join(projectRoot, 'public', 'uploads', 'images')
  ];

  dirs.forEach(dir => {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      } else {
        console.log(`Directory already exists: ${dir}`);
      }
    } catch (error) {
      console.error(`Error creating directory ${dir}:`, error);
    }
  });
};

// Create directories on startup
createUploadDirs();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine the upload directory based on the field name
    let uploadDir;
    if (file.fieldname === 'profileImage') {
      uploadDir = path.join(projectRoot, 'public', 'uploads', 'profile-images');
    } else {
      uploadDir = path.join(projectRoot, 'public', 'uploads', 'images');
    }
    
    // Ensure directory exists
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`Created upload directory: ${uploadDir}`);
      }
      
      // Verify directory is writable
      fs.accessSync(uploadDir, fs.constants.W_OK);
      console.log(`Upload directory is writable: ${uploadDir}`);
      
      cb(null, uploadDir);
    } catch (error) {
      console.error(`Error with upload directory ${uploadDir}:`, error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with timestamp
    const timestamp = Date.now();
    const uniqueName = `profile-${timestamp}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    console.log(`Generated filename: ${uniqueName}`);
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;