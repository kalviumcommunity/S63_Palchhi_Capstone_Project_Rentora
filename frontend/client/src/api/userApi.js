import axiosInstance from '../utils/axiosConfig';

export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get('/auth/me');
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

    const response = await axiosInstance.put(`/auth/users/${userId}`, cleanData);
    
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

export const uploadProfileImage = async (formData, onProgress) => {
  try {
    // Get the current user from the auth context
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser || !currentUser._id) {
      throw new Error('User not found');
    }

    const response = await axiosInstance.put(`/auth/users/${currentUser._id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) {
          onProgress(percentCompleted);
        }
      }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Upload failed');
    }

    return {
      success: true,
      data: {
        profileImage: response.data.data.profileImage
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
    const response = await axiosInstance.delete(`/auth/users/${userId}`, {
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
    const response = await axiosInstance.delete(`/listings/${listingId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting listing:', error);
    throw error;
  }
};

export const updateNotificationPreferences = async (userId, preferences) => {
  try {
    const response = await axiosInstance.put(`/auth/users/${userId}/preferences`, preferences);
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
    const response = await axiosInstance.post('/auth/login', { email, password });
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
