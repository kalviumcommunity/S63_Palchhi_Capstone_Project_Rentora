/**
 * Utility functions for handling profile images
 */

import { API_URL, DEFAULT_IMAGE_PATHS, CACHE_CONFIG } from '../config';

// Cache for image URLs
const imageUrlCache = new Map();

/**
 * Checks if a URL is a Google profile image
 * @param {string} url - The image URL to check
 * @returns {boolean} - True if it's a Google profile image
 */
export const isGoogleProfileImage = (url) => {
    return url && typeof url === 'string' && (
      url.includes('googleusercontent.com') || 
      url.includes('google.com/a/')
    );
  };
  
  /**
   * Gets a safe version of the profile image URL
   * For Google images, this uses our proxy to avoid rate limiting
   * @param {string} url - The original image URL
   * @param {string} fallbackUrl - Fallback URL to use if the image is problematic
   * @returns {string} - The safe image URL
   */
  export const getSafeProfileImageUrl = (url, fallbackUrl) => {
    if (!url) return fallbackUrl;
    
    // For Google images, use our proxy
    if (isGoogleProfileImage(url)) {
      // If the URL already contains our proxy path, don't double-proxy it
      if (url.includes('/api/proxy/google-image')) {
        // Just add a timestamp to prevent caching issues
        return `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`;
      }
      
      // Encode the URL to pass as a query parameter
      const encodedUrl = encodeURIComponent(url);
      // Add a timestamp to prevent caching issues
      const timestamp = Date.now();
      return `${API_URL}/proxy/google-image?imageUrl=${encodedUrl}&t=${timestamp}`;
    }
    
    // For local images, add the full server URL if needed
    if (url && !url.includes('http')) {
      // Add a timestamp to prevent caching issues for local images too
      const timestamp = Date.now();
      return `${API_URL}${url}?t=${timestamp}`;
    }
    
    // For other images, return as is with a timestamp
    return `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`;
  };
  
  /**
   * Preloads an image to ensure it's in the browser cache
   * @param {string} url - The image URL to preload
   * @returns {Promise} - A promise that resolves when the image is loaded or rejects on error
   */
  export const preloadImage = (imagePath) => {
    const url = getImageUrl(imagePath);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  };
  
  /**
   * Default SVG avatar as a data URI
   */
  export const DEFAULT_AVATAR_SVG = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIj48L3BhdGg+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ij48L2NpcmNsZT48L3N2Zz4=';

// Utility functions for handling image URLs

/**
 * Get the proper image URL, handling both local and Cloudinary URLs
 * @param {string} imagePath - The image path or URL
 * @param {string} defaultImage - Default image path
 * @returns {string} - The complete image URL
 */
export const getImageUrl = (imagePath, defaultImage = '/default-property.jpg') => {
  if (!imagePath) {
    return defaultImage;
  }

  // If it's already a full URL (Cloudinary or external), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a local path, construct the full URL
  const backendUrl = API_URL;
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  return `${backendUrl}/${cleanPath}`;
};

/**
 * Get profile image URL
 * @param {string} profileImage - Profile image path or URL
 * @returns {string} - The complete profile image URL
 */
export const getProfileImageUrl = (profileImage) => {
  return getImageUrl(profileImage, '/uploads/images/default-avatar.jpg');
};

/**
 * Get property image URL
 * @param {string} propertyImage - Property image path or URL
 * @returns {string} - The complete property image URL
 */
export const getPropertyImageUrl = (propertyImage) => {
  return getImageUrl(propertyImage, '/uploads/images/default-property.jpg');
};

/**
 * Get payment proof URL
 * @param {string} paymentProof - Payment proof path or URL
 * @returns {string} - The complete payment proof URL
 */
export const getPaymentProofUrl = (paymentProof) => {
  return getImageUrl(paymentProof, '/uploads/images/default-property.jpg');
};

/**
 * Check if an image URL is from Cloudinary
 * @param {string} imageUrl - The image URL to check
 * @returns {boolean} - True if it's a Cloudinary URL
 */
export const isCloudinaryUrl = (imageUrl) => {
  return imageUrl && imageUrl.includes('cloudinary');
};

/**
 * Get optimized image URL for Cloudinary images
 * @param {string} imageUrl - The original Cloudinary URL
 * @param {Object} options - Transformation options
 * @returns {string} - The optimized image URL
 */
export const getOptimizedImageUrl = (imageUrl, options = {}) => {
  if (!isCloudinaryUrl(imageUrl)) {
    return imageUrl;
  }

  // Default optimization options
  const defaultOptions = {
    width: 800,
    height: 600,
    crop: 'fill',
    quality: 'auto:good'
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  // For Cloudinary URLs, we can add transformation parameters
  // This is a simplified approach - in production you might want to use Cloudinary's URL transformation API
  return imageUrl;
};

/**
 * Get thumbnail URL for images
 * @param {string} imageUrl - The original image URL
 * @param {number} width - Thumbnail width
 * @param {number} height - Thumbnail height
 * @returns {string} - The thumbnail URL
 */
export const getThumbnailUrl = (imageUrl, width = 300, height = 200) => {
  return getOptimizedImageUrl(imageUrl, { width, height, crop: 'fill' });
};

export const formatImageUrl = (imagePath) => {
  return getImageUrl(imagePath);
};

export const handleImageError = (e, originalPath) => {
  console.log('Image load failed:', {
    src: e.target.src,
    originalPath
  });
  
  // Temporarily disable image cache for this session if we're having persistent issues
  if (!window.IMAGE_ERROR_COUNT) {
    window.IMAGE_ERROR_COUNT = 1;
  } else {
    window.IMAGE_ERROR_COUNT++;
    
    // If we have too many errors, disable caching
    if (window.IMAGE_ERROR_COUNT > 5) {
      console.warn('Too many image errors, disabling image cache');
      window.DISABLE_IMAGE_CACHE = true;
      
      // Clear the existing cache
      clearImageCache();
    }
  }
  
  // Remove failed URL from cache
  if (originalPath) {
    const isProfileImage = originalPath.includes('profile-images/');
    const cacheKey = `${originalPath}_${isProfileImage ? 'profile' : 'property'}`;
    imageUrlCache.delete(cacheKey);
  }
  
  try {
    const currentSrc = e.target.src;
  const isProfileImage = originalPath?.includes('/profile-images/');
  const baseUrl = API_URL;
    
    // First fallback: try without cache-busting parameter
    if (currentSrc.includes('?t=') || currentSrc.includes('?nocache=')) {
      const baseUrlWithoutParams = currentSrc.split('?')[0];
      console.log('Trying without cache parameter:', baseUrlWithoutParams);
      e.target.src = baseUrlWithoutParams;
      return;
    }
    
    // Second fallback: try the backend default image
    const backendDefault = `${baseUrl}/uploads/images/${isProfileImage ? 'default-avatar.jpg' : 'default-property.jpg'}`;
    if (!currentSrc.includes('default-')) {
      console.log('Trying backend default:', backendDefault);
      e.target.src = backendDefault;
      return;
    }
    
    // Third fallback: try alternative filename patterns
    const filename = originalPath?.split('/').pop();
    if (filename && !currentSrc.includes(filename)) {
      const alternativeUrl = `${baseUrl}${isProfileImage ? '/uploads/profile-images/' : '/uploads/images/'}${filename}`;
      console.log('Trying alternative filename path:', alternativeUrl);
      e.target.src = alternativeUrl;
      return;
    }
    
    // Final fallback: use SVG placeholder
    console.log('All fallbacks failed, using SVG placeholder');
    e.target.onerror = null;
    
    if (isProfileImage) {
      e.target.src = DEFAULT_AVATAR_SVG;
    } else {
      // Property placeholder SVG
      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1IiBzdHJva2U9IiNkZGQiIHN0cm9rZS13aWR0aD0iMiIvPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIwMCwxNTApIj48Y2lyY2xlIGN4PSIwIiBjeT0iLTIwIiByPSIzMCIgZmlsbD0iI2NjYyIvPjxyZWN0IHg9Ii00MCIgeT0iMTAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI0MCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjAiIHk9IjcwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlIEF2YWlsYWJsZTwvdGV4dD48L2c+PC9zdmc+';
    }
    
  } catch (err) {
    console.error('Error in image fallback handling:', err);
    // Ultimate fallback
    e.target.onerror = null;
    e.target.src = originalPath?.includes('/profile-images/') 
      ? DEFAULT_AVATAR_SVG
      : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
  }
};

// Clear image cache
export const clearImageCache = () => {
  imageUrlCache.clear();
};