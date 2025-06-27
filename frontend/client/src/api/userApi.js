import axiosInstance from '../utils/axiosConfig';

export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get('/api/auth/me');
    return {
      success: true,
      user: response.data.data
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch user data'
    };
  }
};

export const updateUserProfile = async (userId, userData) => {
  try {
    // Remove any undefined or null values
    const cleanData = Object.fromEntries(
      Object.entries(userData).filter(([_, value]) => value != null)
    );

    const response = await axiosInstance.put(`/api/auth/users/${userId}`, cleanData);
    
    // Update the token if a new one is provided
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update profile'
    };
  }
};

export const uploadProfileImage = async (userId, formData, onProgress) => {
  try {
    // Use the provided userId instead of getting it from localStorage
    if (!userId) {
      // Fallback to localStorage if userId is not provided
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser || !currentUser._id) {
        throw new Error('User not found');
      }
      userId = currentUser._id;
    }

    const response = await axiosInstance.put(`/api/auth/users/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: onProgress ? (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      } : undefined
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Upload failed');
    }

    // Log the complete response data for debugging
    console.log('Profile image upload API response:', response.data);
    
    // Return all relevant data from the response
    return {
      success: true,
      data: {
        profileImage: response.data.data.profileImage,
        // Include any other fields that might be in the response
        ...response.data.data
      },
      message: 'Profile image uploaded successfully'
    };
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to upload profile image'
    };
  }
};

export const deleteAccount = async (userId) => {
  try {
    const response = await axiosInstance.delete(`/api/auth/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};

export const deleteListing = async (listingId) => {
  try {
    const response = await axiosInstance.delete(`/api/listings/${listingId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting listing:', error);
    throw error;
  }
};

export const updateNotificationPreferences = async (userId, preferences) => {
  try {
    const response = await axiosInstance.put(`/api/auth/users/${userId}/preferences`, preferences);
    return {
      success: true,
      data: response.data.data,
      message: 'Notification preferences updated successfully'
    };
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update notification preferences'
    };
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await axiosInstance.post('/api/auth/login', { email, password });
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error logging in:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Login failed'
    };
  }
};
