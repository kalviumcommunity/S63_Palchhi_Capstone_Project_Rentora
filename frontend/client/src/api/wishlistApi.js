import axiosInstance from '../utils/axiosConfig';

export const addToWishlist = async (listingId) => {
  try {
    const response = await axiosInstance.post('/wishlist/add', { listingId });
    return response.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

export const removeFromWishlist = async (listingId) => {
  try {
    const response = await axiosInstance.delete(`/wishlist/remove/${listingId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

export const getWishlist = async () => {
  try {
    const response = await axiosInstance.get('/wishlist');
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

export const checkWishlistStatus = async (listingId) => {
  try {
    const response = await axiosInstance.get(`/wishlist/check/${listingId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking wishlist status:', error);
    throw error;
  }
};

export const clearWishlist = async () => {
  try {
    const response = await axiosInstance.delete('/wishlist/clear');
    return response.data;
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    throw error;
  }
};

// Alias for isInWishlist to maintain compatibility with existing code
export const checkWishlist = checkWishlistStatus;
