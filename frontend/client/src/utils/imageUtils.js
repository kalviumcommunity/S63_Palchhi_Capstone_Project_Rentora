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
  
  // Check cache first
  if (imageUrlCache.has(imagePath)) {
    return imageUrlCache.get(imagePath);
  }
  
  let url;
  if (imagePath.startsWith('http')) {
    url = imagePath;
  } else {
    // Normalize path
    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    // Handle profile images specifically
    if (normalizedPath.includes('profile-images/')) {
      // Keep the original path structure for profile images
      url = `${API_URL}${normalizedPath}`;
    } else {
      // For other images, use the standard path
      url = `${API_URL}${normalizedPath}`;
    }
  }
  
  // Cache the URL
  imageUrlCache.set(imagePath, url);
  
  // Implement cache size limit
  if (imageUrlCache.size > CACHE_CONFIG.MAX_CACHE_SIZE) {
    const firstKey = imageUrlCache.keys().next().value;
    imageUrlCache.delete(firstKey);
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
  
  // Remove failed URL from cache
  imageUrlCache.delete(originalPath);
  
  // Try alternative paths
  const filename = originalPath?.split('/').pop();
  if (filename) {
    const isProfileImage = originalPath?.includes('/profile-images/');
    const alternativePaths = [
      isProfileImage ? `/uploads/profile-images/${filename}` : `/uploads/images/${filename}`,
      isProfileImage ? DEFAULT_IMAGE_PATHS.AVATAR : DEFAULT_IMAGE_PATHS.PROPERTY
    ];
    
    for (const path of alternativePaths) {
      const url = getImageUrl(path);
      if (url !== e.target.src) {
        console.log('Trying alternative path:', url);
        e.target.src = url;
        return;
      }
    }
  }
  
  // If all attempts fail, use default image
  e.target.src = originalPath?.includes('/profile-images/') 
    ? DEFAULT_IMAGE_PATHS.AVATAR
    : DEFAULT_IMAGE_PATHS.PROPERTY;
};

// Clear image cache
export const clearImageCache = () => {
  imageUrlCache.clear();
};