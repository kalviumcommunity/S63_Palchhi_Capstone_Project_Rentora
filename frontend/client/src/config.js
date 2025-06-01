// API Configuration
export const API_URL = 'http://localhost:8000/api';

// Default image paths
export const DEFAULT_IMAGE_PATHS = {
  AVATAR: '/uploads/images/default-avatar.jpg',
  PROPERTY: '/uploads/images/default-property.jpg'
};

// Cache configuration
export const CACHE_CONFIG = {
  MAX_CACHE_SIZE: 100,
  CACHE_DURATION: 5 * 60 * 1000 // 5 minutes
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh-token'
  },
  USER: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/update-profile',
    UPLOAD_IMAGE: '/users/upload-profile-image'
  },
  LISTINGS: {
    ALL: '/listings',
    SINGLE: (id) => `/listings/${id}`,
    CREATE: '/listings',
    UPDATE: (id) => `/listings/${id}`,
    DELETE: (id) => `/listings/${id}`
  },
  BOOKINGS: {
    ALL: '/bookings',
    SINGLE: (id) => `/bookings/${id}`,
    CREATE: '/bookings',
    UPDATE: (id) => `/bookings/${id}`,
    DELETE: (id) => `/bookings/${id}`,
    PAYMENT_PROOF: (id) => `/token-bookings/${id}/payment-proof`
  }
}; 