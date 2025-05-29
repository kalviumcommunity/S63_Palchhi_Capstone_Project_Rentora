import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
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
    // Always get the latest token from localStorage
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
        return new Promise((resolve) => {
          setTimeout(() => {
            requestThrottleMap.set(config.url, now);
            resolve(config);
          }, 5000 - (now - lastRequestTime));
        });
      }
      
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
  (response) => {
    // Update token if it's included in the response
    if (response.data && response.data.token) {
      const newToken = response.data.token;
      localStorage.setItem('token', newToken);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    }
    return response;
  },
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
      originalRequest._retryCount = originalRequest._retryCount || 0;
      
      if (originalRequest._retryCount < 3) {
        originalRequest._retryCount++;
        
        let retryAfter = parseInt(error.response.headers['retry-after']) || 0;
        
        if (!retryAfter) {
          const baseDelay = Math.pow(2, originalRequest._retryCount);
          const jitter = Math.random() * 0.5;
          retryAfter = baseDelay + jitter;
        }
        
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        
        if (originalRequest.url.includes('/notifications')) {
          const separator = originalRequest.url.includes('?') ? '&' : '?';
          originalRequest.url = `${originalRequest.url}${separator}_=${Date.now()}`;
        }
        
        return axiosInstance(originalRequest);
      }
    }
    
    // Handle unauthorized access
    if (error.response?.status === 401) {
      // Only clear auth data if it's not a profile update request
      if (!originalRequest.url.includes('/auth/users/')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axiosInstance.defaults.headers.common['Authorization'];
        
        // Only redirect to login if we're not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 