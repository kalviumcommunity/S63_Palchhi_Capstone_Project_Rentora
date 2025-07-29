const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Import models
const User = require('../models/User');
const Listing = require('../models/Listing');
const TokenBooking = require('../models/TokenBooking');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Upload file to Cloudinary
const uploadToCloudinary = async (filePath, folder) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return null;
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto'
    });

    console.log(`Uploaded to Cloudinary: ${filePath} -> ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`Error uploading ${filePath}:`, error);
    return null;
  }
};

// Migrate user profile images
const migrateProfileImages = async () => {
  console.log('\n=== Migrating Profile Images ===');
  
  const users = await User.find({ profileImage: { $exists: true, $ne: null } });
  console.log(`Found ${users.length} users with profile images`);

  for (const user of users) {
    if (user.profileImage && !user.profileImage.includes('cloudinary')) {
      const filePath = path.join(__dirname, '..', 'public', user.profileImage);
      const cloudinaryUrl = await uploadToCloudinary(filePath, 'rentora/profile-images');
      
      if (cloudinaryUrl) {
        user.profileImage = cloudinaryUrl;
        await user.save();
        console.log(`Updated user ${user._id}: ${user.profileImage} -> ${cloudinaryUrl}`);
      }
    }
  }
};

// Migrate listing images
const migrateListingImages = async () => {
  console.log('\n=== Migrating Listing Images ===');
  
  const listings = await Listing.find({ images: { $exists: true, $ne: [] } });
  console.log(`Found ${listings.length} listings with images`);

  for (const listing of listings) {
    if (listing.images && listing.images.length > 0) {
      const updatedImages = [];
      
      for (const imagePath of listing.images) {
        if (imagePath && !imagePath.includes('cloudinary')) {
          const filePath = path.join(__dirname, '..', 'public', imagePath);
          const cloudinaryUrl = await uploadToCloudinary(filePath, 'rentora/listing-images');
          
          if (cloudinaryUrl) {
            updatedImages.push(cloudinaryUrl);
            console.log(`Updated listing image: ${imagePath} -> ${cloudinaryUrl}`);
          } else {
            updatedImages.push(imagePath); // Keep original if upload fails
          }
        } else {
          updatedImages.push(imagePath); // Keep Cloudinary URLs as is
        }
      }
      
      listing.images = updatedImages;
      await listing.save();
      console.log(`Updated listing ${listing._id} with ${updatedImages.length} images`);
    }
  }
};

// Migrate listing videos
const migrateListingVideos = async () => {
  console.log('\n=== Migrating Listing Videos ===');
  
  const listings = await Listing.find({ videos: { $exists: true, $ne: [] } });
  console.log(`Found ${listings.length} listings with videos`);

  for (const listing of listings) {
    if (listing.videos && listing.videos.length > 0) {
      const updatedVideos = [];
      
      for (const videoPath of listing.videos) {
        if (videoPath && !videoPath.includes('cloudinary')) {
          const filePath = path.join(__dirname, '..', 'public', videoPath);
          const cloudinaryUrl = await uploadToCloudinary(filePath, 'rentora/listing-videos');
          
          if (cloudinaryUrl) {
            updatedVideos.push(cloudinaryUrl);
            console.log(`Updated listing video: ${videoPath} -> ${cloudinaryUrl}`);
          } else {
            updatedVideos.push(videoPath); // Keep original if upload fails
          }
        } else {
          updatedVideos.push(videoPath); // Keep Cloudinary URLs as is
        }
      }
      
      listing.videos = updatedVideos;
      await listing.save();
      console.log(`Updated listing ${listing._id} with ${updatedVideos.length} videos`);
    }
  }
};

// Migrate payment proofs
const migratePaymentProofs = async () => {
  console.log('\n=== Migrating Payment Proofs ===');
  
  const bookings = await TokenBooking.find({ paymentProof: { $exists: true, $ne: null } });
  console.log(`Found ${bookings.length} bookings with payment proofs`);

  for (const booking of bookings) {
    if (booking.paymentProof && !booking.paymentProof.includes('cloudinary')) {
      const filePath = path.join(__dirname, '..', 'public', booking.paymentProof);
      const cloudinaryUrl = await uploadToCloudinary(filePath, 'rentora/payment-proofs');
      
      if (cloudinaryUrl) {
        booking.paymentProof = cloudinaryUrl;
        await booking.save();
        console.log(`Updated booking ${booking._id}: ${booking.paymentProof} -> ${cloudinaryUrl}`);
      }
    }
  }
};

// Main migration function
const migrateToCloudinary = async () => {
  try {
    await connectDB();
    
    console.log('Starting migration to Cloudinary...');
    
    await migrateProfileImages();
    await migrateListingImages();
    await migrateListingVideos();
    await migratePaymentProofs();
    
    console.log('\n=== Migration Complete ===');
    console.log('All images have been migrated to Cloudinary!');
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run migration if this script is executed directly
if (require.main === module) {
  migrateToCloudinary();
}

module.exports = { migrateToCloudinary }; 