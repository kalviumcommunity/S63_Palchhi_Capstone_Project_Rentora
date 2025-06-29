import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { getCurrentUser, updateUserProfile, loginUser } from '../api/userApi';
import { isGoogleProfileImage } from '../utils/imageUtils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize user state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axiosInstance.get('/auth/me');
          if (response.data.success) {
            setUser(response.data.user);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get('/auth/me');
        if (response.data.success) {
          const userData = response.data.user;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          clearAuthData();
        }
      } catch (error) {
        if (error.response?.status === 401) {
          clearAuthData();
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axiosInstance.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Starting login process');
      const response = await loginUser(email, password);
      console.log('AuthContext: Login response received:', response);
      
      if (response.success) {
        const { user, token } = response.data;
        console.log('AuthContext: Setting user and token');
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return { success: true };
      } else {
        console.error('AuthContext: Login failed:', response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      if (response.data.success) {
        const { token, user: newUser } = response.data.data;
        
        // Set token in axios headers and localStorage
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('token', token);
        
        // Set user data in state and localStorage
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    clearAuthData();
    window.location.href = '/login';
  };

  const updateProfile = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axiosInstance.put('/auth/users/profile', userData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const updatedUser = response.data.data;
        
        // Ensure the profile image URL has a timestamp to prevent caching
        if (updatedUser.profileImage) {
          const timestamp = Date.now();
          updatedUser.profileImage = `${updatedUser.profileImage}?t=${timestamp}`;
        }
        
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('user-profile-updated', {
          detail: { user: updatedUser }
        }));
        
        return { success: true, data: updatedUser };
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Failed to update profile'
      };
    }
  };

  const refreshUserData = async () => {
    try {
      const response = await getCurrentUser();
      if (response.success) {
        const updatedUser = response.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      }
      return { success: false, message: 'Failed to get current user data' };
    } catch (error) {
      if (error.response?.status === 401) {
        clearAuthData();
      }
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error refreshing user data'
      };
    }
  };

  const handleGoogleAuthSuccess = async (token, userData) => {
    try {
      if (!token || !userData) {
        throw new Error('Invalid Google auth data');
      }

      // Set token in axios headers and localStorage
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      
      // Set user data in state and localStorage
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Google authentication failed'
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshUserData,
    handleGoogleAuthSuccess,
    setUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
