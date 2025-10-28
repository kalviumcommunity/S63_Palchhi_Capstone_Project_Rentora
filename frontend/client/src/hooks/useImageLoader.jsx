import { useState, useEffect } from 'react';
import { formatImageUrl } from '../utils/imageUtils';

/**
 * Custom hook for loading images with fallback handling
 * @param {string} imagePath - The original image path
 * @param {string} fallbackPath - Optional fallback image path
 * @returns {object} - { src, isLoading, hasError, retry }
 */
export const useImageLoader = (imagePath, fallbackPath = null) => {
  const [src, setSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const maxRetries = 3;

  const loadImage = (path, attempt = 0) => {
    if (!path) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    let imageUrl;
    
    try {
      imageUrl = formatImageUrl(path);
    } catch (error) {
      console.error('Error formatting image URL:', error);
      setIsLoading(false);
      setHasError(true);
      return;
    }

    img.onload = () => {
      // Check if the image actually loaded content (not just a placeholder)
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setSrc(imageUrl);
        setIsLoading(false);
        setHasError(false);
      } else {
        // Image loaded but has no dimensions, treat as error
        img.onerror();
      }
    };

    img.onerror = () => {
      console.error(`Failed to load image (attempt ${attempt + 1}):`, imageUrl);
      
      if (attempt < maxRetries) {
        // Try again with a slight delay and different cache-busting
        setTimeout(() => {
          loadImage(path, attempt + 1);
        }, 500 * (attempt + 1)); // Shorter delay, exponential backoff
      } else if (fallbackPath && path !== fallbackPath) {
        // Try fallback image
        console.log('Trying fallback image:', fallbackPath);
        loadImage(fallbackPath, 0);
      } else {
        // All attempts failed
        setIsLoading(false);
        setHasError(true);
        
        // Set a default SVG placeholder
        const isProfileImage = path?.includes('profile-images');
        const placeholder = isProfileImage 
          ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1IiBzdHJva2U9IiNkZGQiIHN0cm9rZS13aWR0aD0iMiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iMzAiIHI9IjE1IiBmaWxsPSIjY2NjIi8+PHBhdGggZD0iTTIwIDgwIFEyMCA2MCA1MCA2MCBRODAgNjAgODAgODAgWiIgZmlsbD0iI2NjYyIvPjwvc3ZnPg=='
          : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1IiBzdHJva2U9IiNkZGQiIHN0cm9rZS13aWR0aD0iMiIvPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIwMCwxNTApIj48Y2lyY2xlIGN4PSIwIiBjeT0iLTIwIiByPSIzMCIgZmlsbD0iI2NjYyIvPjxyZWN0IHg9Ii00MCIgeT0iMTAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI0MCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjAiIHk9IjcwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0PjwvZz48L3N2Zz4=';
        
        setSrc(placeholder);
      }
    };

    // Set a timeout to prevent hanging requests
    const timeout = setTimeout(() => {
      img.onerror();
    }, 10000); // 10 second timeout

    img.onload = () => {
      clearTimeout(timeout);
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setSrc(imageUrl);
        setIsLoading(false);
        setHasError(false);
      } else {
        img.onerror();
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      console.error(`Failed to load image (attempt ${attempt + 1}):`, imageUrl);
      
      if (attempt < maxRetries) {
        setTimeout(() => {
          loadImage(path, attempt + 1);
        }, 500 * (attempt + 1));
      } else if (fallbackPath && path !== fallbackPath) {
        console.log('Trying fallback image:', fallbackPath);
        loadImage(fallbackPath, 0);
      } else {
        setIsLoading(false);
        setHasError(true);
        
        const isProfileImage = path?.includes('profile-images');
        const placeholder = isProfileImage 
          ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1IiBzdHJva2U9IiNkZGQiIHN0cm9rZS13aWR0aD0iMiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iMzAiIHI9IjE1IiBmaWxsPSIjY2NjIi8+PHBhdGggZD0iTTIwIDgwIFEyMCA2MCA1MCA2MCBRODAgNjAgODAgODAgWiIgZmlsbD0iI2NjYyIvPjwvc3ZnPg=='
          : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1IiBzdHJva2U9IiNkZGQiIHN0cm9rZS13aWR0aD0iMiIvPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIwMCwxNTApIj48Y2lyY2xlIGN4PSIwIiBjeT0iLTIwIiByPSIzMCIgZmlsbD0iI2NjYyIvPjxyZWN0IHg9Ii00MCIgeT0iMTAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI0MCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjAiIHk9IjcwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0PjwvZz48L3N2Zz4=';
        
        setSrc(placeholder);
      }
    };

    img.src = imageUrl;
  };

  const retry = () => {
    setRetryCount(prev => prev + 1);
    loadImage(imagePath, 0);
  };

  useEffect(() => {
    if (imagePath) {
      console.log('useImageLoader: Loading image:', imagePath);
      loadImage(imagePath, 0);
    } else {
      console.log('useImageLoader: No image path provided');
      setIsLoading(false);
      setHasError(true);
    }
  }, [imagePath, fallbackPath, retryCount]);

  return {
    src,
    isLoading,
    hasError,
    retry
  };
};

/**
 * Component wrapper for images with built-in error handling
 */
export const SafeImage = ({ 
  src, 
  alt, 
  className, 
  fallbackSrc, 
  onLoad, 
  onError,
  ...props 
}) => {
  const { src: safeSrc, isLoading, hasError, retry } = useImageLoader(src, fallbackSrc);

  const handleLoad = (e) => {
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    if (onError) onError(e);
    // The hook already handles retries, so we don't need to do anything else here
  };

  if (isLoading) {
    return (
      <div className={`image-loading ${className || ''}`} {...props}>
        <div className="loading-placeholder">Loading...</div>
      </div>
    );
  }

  return (
    <img
      src={safeSrc}
      alt={alt}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
};

export default useImageLoader;