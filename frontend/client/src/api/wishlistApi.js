import axiosInstance from '../utils/axiosConfig';

export const addToWishlist = async (listingId) => {
  try {
    const response = await axiosInstance.post('/wishlist/add', { listingId });
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to add to wishlist'
    };
  }
};

export const removeFromWishlist = async (listingId) => {
  try {
    const response = await axiosInstance.delete(`/wishlist/remove/${listingId}`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to remove from wishlist'
    };
  }
};

export const getWishlist = async () => {
  try {
    const response = await axiosInstance.get('/wishlist');
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch wishlist'
    };
  }
};

export const isInWishlist = async (listingId) => {
  try {
    const response = await axiosInstance.get(`/wishlist/check/${listingId}`);
    return {
      success: true,
      isInWishlist: response.data.inWishlist
    };
  } catch (error) {
    console.error('Error checking wishlist status:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to check wishlist status'
    };
  }
};

export const clearWishlist = async () => {
  try {
    const response = await axiosInstance.delete('/wishlist/clear');
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to clear wishlist'
    };
  }
};

// Alias for isInWishlist to maintain compatibility with existing code
export const checkWishlist = isInWishlist;
