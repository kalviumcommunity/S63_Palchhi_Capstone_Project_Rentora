import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Initialize token from localStorage if it exists
const token = localStorage.getItem('token');
if (token) {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Request throttling mechanism
const requestThrottleMap = new Map();

// Request interceptor with throttling
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Implement request throttling for notification endpoints
    if (config.url.includes('/notifications')) {
      const now = Date.now();
      const lastRequestTime = requestThrottleMap.get(config.url) || 0;
      
      // If this is a GET request to a notification endpoint and we've made a request recently
      if (config.method === 'get' && now - lastRequestTime < 5000) { // 5 seconds throttle
        console.log(`Throttling request to ${config.url}`);
        
        // Return a promise that resolves with a mock response after a delay
        return new Promise((resolve) => {
          setTimeout(() => {
            // Update the last request time
            requestThrottleMap.set(config.url, now);
            resolve(config);
          }, 5000 - (now - lastRequestTime)); // Wait the remaining time
        });
      }
      
      // Update the last request time
      requestThrottleMap.set(config.url, now);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced rate limiting handling and exponential backoff
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Skip retry for certain endpoints that should fail fast
    const skipRetryEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/logout'
    ];
    
    const shouldSkipRetry = skipRetryEndpoints.some(endpoint => 
      originalRequest.url.includes(endpoint)
    );
    
    // Handle rate limiting (429 Too Many Requests)
    if (error.response?.status === 429 && !shouldSkipRetry) {
      // Track retry count
      originalRequest._retryCount = originalRequest._retryCount || 0;
      
      // Only retry up to 3 times
      if (originalRequest._retryCount < 3) {
        originalRequest._retryCount++;
        
        // Get retry-after header or use exponential backoff
        let retryAfter = parseInt(error.response.headers['retry-after']) || 0;
        
        // If no retry-after header, use exponential backoff with jitter
        if (!retryAfter) {
          const baseDelay = Math.pow(2, originalRequest._retryCount);
          const jitter = Math.random() * 0.5; // Add up to 50% jitter
          retryAfter = baseDelay + jitter;
        }
        
        console.log(`Rate limited. Retry ${originalRequest._retryCount}/3 after ${retryAfter.toFixed(1)} seconds...`);
        
        // Wait for the specified time
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        
        // For notification endpoints, add a cache-busting parameter
        if (originalRequest.url.includes('/notifications')) {
          const separator = originalRequest.url.includes('?') ? '&' : '?';
          originalRequest.url = `${originalRequest.url}${separator}_=${Date.now()}`;
        }
        
        // Retry the request
        return axiosInstance(originalRequest);
      } else {
        console.log('Maximum retry attempts reached. Giving up.');
        // Create a custom error message for max retries
        error.message = 'Maximum retry attempts reached due to rate limiting';
      }
    }
    
    // Handle unauthorized access
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axiosInstance.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 