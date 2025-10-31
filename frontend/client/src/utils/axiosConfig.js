import axios from 'axios';
import { API_URL, API_WITH_CREDENTIALS } from '../config';

// Create axios instance with default config
// Use API_URL from config (which has a production fallback) to ensure correct base URL
const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  // Increase default timeout to 60s to reduce false timeouts from slow networks or cold functions
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Allow toggling credentials via Vite env VITE_API_WITH_CREDENTIALS (default 'true')
  withCredentials: API_WITH_CREDENTIALS === 'true'
});

// Initialize token from localStorage if it exists
const token = localStorage.getItem('token');
if (token) {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Always get the latest token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add cache-busting parameter for GET requests
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }

    // Log request for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        method: config.method,
        url: config.url,
        params: config.params,
        data: config.data,
        headers: config.headers
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Update token if it's included in the response
    if (response.data && response.data.token) {
      const newToken = response.data.token;
      localStorage.setItem('token', newToken);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    }

      // Log successful response for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
    }
    
    return response;
  },
    async (error) => {
      // Log error response for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.error('API Error:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          data: error.response?.data,
          config: error.config,
          // If the request was made but no response was received (network or CORS), error.request will be present
          request: error.request
        });
      }

    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {
          refreshToken
        });
        
        const { token } = response.data;
        
        // Update token in localStorage
        localStorage.setItem('token', token);
        
        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        delete axiosInstance.defaults.headers.common['Authorization'];
        
        // Only redirect to login if we're not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    } else if (error.response?.status === 401) {
      // Handle unauthorized access (fallback for when refresh token is not available)
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      delete axiosInstance.defaults.headers.common['Authorization'];
      
      // Only redirect to login if we're not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 