# Cloudinary Integration Guide

This guide explains how Cloudinary has been integrated into the Rentora project for handling all image and video uploads.

## Overview

Cloudinary has been integrated to replace local file storage for all image uploads including:
- Profile images
- Listing images and videos
- Payment proof uploads

## Features

- **Automatic Image Optimization**: Images are automatically resized and optimized
- **Secure Cloud Storage**: All files are stored securely in the cloud
- **CDN Delivery**: Fast global content delivery
- **Automatic Cleanup**: Old images are deleted when replaced or when listings are deleted
- **Multiple File Types**: Support for images (JPG, PNG, GIF, WebP) and videos (MP4, AVI, MOV, WMV)

## Environment Variables

Add these to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Setup Instructions

### 1. Create Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/) and create a free account
2. Get your credentials from the Dashboard:
   - Cloud Name
   - API Key
   - API Secret

### 2. Install Dependencies

The required packages are already installed:
```bash
npm install cloudinary multer-storage-cloudinary
```

### 3. Configure Environment Variables

Add your Cloudinary credentials to the backend `.env` file.

### 4. Deploy Backend

Deploy your backend to Render with the new environment variables.

### 5. Migrate Existing Images (Optional)

If you have existing local images, run the migration script:

```bash
cd backend
npm run migrate:cloudinary
```

## File Structure

```
backend/
├── config/
│   └── cloudinary.js          # Cloudinary configuration
├── controllers/
│   ├── authController.js      # Updated for profile images
│   ├── listingController.js   # Updated for listing media
│   └── tokenBookingController.js # Updated for payment proofs
├── routes/
│   ├── authRoutes.js          # Updated for profile uploads
│   ├── listingRoutes.js       # Updated for media uploads
│   └── tokenBookingRoutes.js  # Updated for payment proofs
└── scripts/
    └── migrateToCloudinary.js # Migration script
```

## API Changes

### Profile Image Upload

**Before:**
```javascript
// Local file storage
const upload = multer({ storage: multer.diskStorage({...}) });
```

**After:**
```javascript
// Cloudinary storage
const { uploadProfileImage } = require('../config/cloudinary');
```

### Listing Media Upload

**Before:**
```javascript
// Local file storage
const upload = multer({ storage: multer.diskStorage({...}) });
```

**After:**
```javascript
// Cloudinary storage with memory buffer
const { uploadListingMedia, uploadMultipleToCloudinary } = require('../config/cloudinary');
```

### Payment Proof Upload

**Before:**
```javascript
// Local file storage
const upload = require('../middleware/upload');
```

**After:**
```javascript
// Cloudinary storage
const { uploadPaymentProof } = require('../config/cloudinary');
```

## Frontend Changes

The frontend has been updated with utility functions to handle both local and Cloudinary URLs:

```javascript
import { 
  getImageUrl, 
  getProfileImageUrl, 
  getPropertyImageUrl,
  getPaymentProofUrl 
} from '../utils/imageUtils';

// Usage
const imageUrl = getPropertyImageUrl(listing.images[0]);
const profileUrl = getProfileImageUrl(user.profileImage);
```

## Cloudinary Folders

Images are organized in Cloudinary folders:
- `rentora/profile-images/` - User profile pictures
- `rentora/listing-images/` - Property listing images
- `rentora/listing-videos/` - Property listing videos
- `rentora/payment-proofs/` - Payment proof documents

## Image Transformations

Cloudinary automatically applies these transformations:
- **Resize**: Max 1000x1000 pixels
- **Quality**: Auto-optimized for good quality
- **Format**: Automatic format optimization

## Security Features

- **File Type Validation**: Only allowed file types are accepted
- **File Size Limits**: 
  - Profile images: 5MB
  - Listing media: 50MB
  - Payment proofs: 10MB
- **Automatic Cleanup**: Old images are deleted when replaced

## Error Handling

The integration includes comprehensive error handling:
- Upload failures are caught and logged
- Graceful fallbacks for missing images
- Database updates only occur after successful uploads

## Monitoring

Monitor your Cloudinary usage:
1. Check the Cloudinary Dashboard for upload statistics
2. Monitor storage usage and bandwidth
3. Review transformation usage

## Troubleshooting

### Common Issues

1. **Upload Fails**
   - Check Cloudinary credentials
   - Verify file size limits
   - Check file type restrictions

2. **Images Not Displaying**
   - Verify Cloudinary URLs are correct
   - Check if images exist in Cloudinary dashboard
   - Ensure proper CORS configuration

3. **Migration Issues**
   - Check file paths in migration script
   - Verify database connection
   - Check Cloudinary API limits

### Debug Mode

Enable debug logging by adding to your `.env`:
```env
DEBUG=cloudinary:*
```

## Performance Benefits

- **Faster Loading**: CDN delivery reduces load times
- **Reduced Server Load**: No local file serving
- **Automatic Optimization**: Images are optimized automatically
- **Scalability**: Cloud storage scales automatically

## Cost Considerations

Cloudinary's free tier includes:
- 25 GB storage
- 25 GB bandwidth per month
- 25,000 transformations per month

For production use, consider upgrading to a paid plan based on your usage.

## Backup Strategy

While Cloudinary is reliable, consider:
- Regular database backups
- Monitoring Cloudinary service status
- Having fallback image URLs

## Support

For Cloudinary-specific issues:
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Support](https://support.cloudinary.com/)

For application-specific issues, check the application logs and error handling. 