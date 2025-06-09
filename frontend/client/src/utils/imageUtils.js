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

export const getImageUrl = (imagePath) => {
  if (!imagePath) return DEFAULT_IMAGE_PATHS.PROPERTY;
  
  // Generate a cache key that includes the path and a flag if it's a profile image
  const isProfileImage = imagePath.includes('profile-images/');
  const cacheKey = `${imagePath}_${isProfileImage ? 'profile' : 'property'}`;
  
  // Check cache first, but don't use cache if we're having issues
  if (imageUrlCache.has(cacheKey) && !window.DISABLE_IMAGE_CACHE) {
    return imageUrlCache.get(cacheKey);
  }
  
  let url;
  
  // If it's already a full URL
  if (imagePath.startsWith('http')) {
    url = imagePath;
  } else {
    // Normalize path - ensure it starts with '/'
    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    // Get the API URL from environment or use default
    const baseUrl = API_URL || 'http://localhost:8000';
    
    // Create the full URL with the API base
    url = `${baseUrl}${normalizedPath}`;
    
    // Add a cache-busting parameter
    const timestamp = Date.now();
    url = `${url}${url.includes('?') ? '&' : '?'}t=${timestamp}`;
  }
  
  // Only cache if not disabled
  if (!window.DISABLE_IMAGE_CACHE) {
    // Cache the URL
    imageUrlCache.set(cacheKey, url);
    
    // Implement cache size limit
    if (imageUrlCache.size > CACHE_CONFIG.MAX_CACHE_SIZE) {
      const firstKey = imageUrlCache.keys().next().value;
      imageUrlCache.delete(firstKey);
    }
  }
  
  return url;
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
    // Try alternative paths
    const filename = originalPath?.split('/').pop();
    if (filename) {
      const isProfileImage = originalPath?.includes('/profile-images/');
      const baseUrl = API_URL || 'http://localhost:8000';
      
      // Try different path combinations
      const alternativePaths = [
        // Direct path with timestamp
        `${baseUrl}${isProfileImage ? '/uploads/profile-images/' : '/uploads/images/'}${filename}?nocache=${Date.now()}`,
        
        // Just the filename in the expected location
        isProfileImage ? `/uploads/profile-images/${filename}` : `/uploads/images/${filename}`,
        
        // Default image
        isProfileImage ? DEFAULT_IMAGE_PATHS.AVATAR : DEFAULT_IMAGE_PATHS.PROPERTY
      ];
      
      // Try the first alternative path
      if (alternativePaths.length > 0) {
        console.log('Trying alternative path:', alternativePaths[0]);
        e.target.src = alternativePaths[0];
        
        // Set up a fallback chain for subsequent alternatives
        let fallbackIndex = 1;
        e.target.onerror = (nextE) => {
          if (fallbackIndex < alternativePaths.length) {
            console.log(`Trying next fallback (${fallbackIndex + 1}/${alternativePaths.length}):`, alternativePaths[fallbackIndex]);
            nextE.target.src = alternativePaths[fallbackIndex];
            fallbackIndex++;
          } else {
            // Final fallback
            console.log('All fallbacks failed, using default image');
            nextE.target.onerror = null;
            nextE.target.src = isProfileImage ? DEFAULT_IMAGE_PATHS.AVATAR : DEFAULT_IMAGE_PATHS.PROPERTY;
          }
        };
        return;
      }
    }
  } catch (err) {
    console.error('Error in image fallback handling:', err);
  }
  
  // If all else fails or if there's an error in our error handler
  e.target.onerror = null;
  e.target.src = originalPath?.includes('/profile-images/') 
    ? DEFAULT_IMAGE_PATHS.AVATAR
    : DEFAULT_IMAGE_PATHS.PROPERTY;
};

// Clear image cache
export const clearImageCache = () => {
  imageUrlCache.clear();
};