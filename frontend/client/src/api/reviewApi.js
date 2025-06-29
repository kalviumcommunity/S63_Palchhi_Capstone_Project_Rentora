import axiosInstance from '../utils/axiosConfig';

export const createReview = async (listingId, reviewData) => {
  try {
    const response = await axiosInstance.post(`/reviews/listing/${listingId}`, {
      rating: reviewData.rating,
      comment: reviewData.comment
    });
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await axiosInstance.put(`/reviews/${reviewId}`, {
      rating: reviewData.rating,
      comment: reviewData.comment
    });
    return response.data;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const response = await axiosInstance.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

export const getListingReviews = async (listingId, page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(`/reviews/listing/${listingId}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching listing reviews:', error);
    throw error;
  }
};

export const getUserReviews = async (page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(`/reviews/user?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw error;
  }
};
