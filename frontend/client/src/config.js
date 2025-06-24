

export const API_URL = 
  `${import.meta.env.VITE_API_URL}`;

// Default image paths
export const DEFAULT_IMAGE_PATHS = {
  AVATAR: '/uploads/images/default-avatar.jpg',
  PROPERTY: '/uploads/images/default-property.jpg',
  TESTIMONIAL: '/uploads/images/default-testimonial.jpg'
};

// Cache configuration
export const CACHE_CONFIG = {
  MAX_CACHE_SIZE: 100,
  CACHE_DURATION: 5 * 60 * 1000 // 5 minutes
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    GET_CURRENT_USER: '/api/auth/me',
    UPDATE_PROFILE: '/api/auth/update-profile',
    UPDATE_PASSWORD: '/api/auth/update-password',
    REFRESH_TOKEN: '/api/auth/refresh-token'
  },
  USER: {
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/update-profile',
    UPLOAD_IMAGE: '/api/users/upload-profile-image'
  },
  LISTINGS: {
    GET_ALL: '/api/listings',
    GET_BY_ID: (id) => `/api/listings/${id}`,
    CREATE: '/api/listings',
    UPDATE: (id) => `/api/listings/${id}`,
    DELETE: (id) => `/api/listings/${id}`,
    SEARCH: '/api/listings/search',
    GET_MY_LISTINGS: '/api/listings/my-listings'
  },
  TOKEN_BOOKINGS: {
    GET_ALL: '/api/token-bookings',
    GET_BY_ID: (id) => `/api/token-bookings/${id}`,
    CREATE: '/api/token-bookings',
    UPDATE: (id) => `/api/token-bookings/${id}`,
    DELETE: (id) => `/api/token-bookings/${id}`,
    CANCEL: (id) => `/api/token-bookings/${id}/cancel`,
    UPLOAD_PROOF: (id) => `/api/token-bookings/${id}/payment-proof`,
    GET_MY_BOOKINGS: '/api/token-bookings/my-bookings'
  }
}; 