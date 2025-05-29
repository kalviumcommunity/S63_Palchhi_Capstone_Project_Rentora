import axiosInstance from '../utils/axiosConfig';

export const createReview = async (listingId, reviewData) => {
  try {
    const response = await axiosInstance.post(`/reviews/listing/${listingId}`, {
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment
    });
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error creating review:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create review'
    };
  }
};

export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await axiosInstance.put(`/reviews/${reviewId}`, {
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment
    });
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error updating review:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update review'
    };
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const response = await axiosInstance.delete(`/reviews/${reviewId}`);
    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting review:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete review'
    };
  }
};

export const getListingReviews = async (listingId, page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(`/reviews/listing/${listingId}?page=${page}&limit=${limit}`);
    return {
      success: true,
      reviews: response.data.data.reviews,
      total: response.data.data.count,
      averageRating: response.data.data.averageRating
    };
  } catch (error) {
    console.error('Error fetching listing reviews:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch listing reviews'
    };
  }
};

export const getUserReviews = async (userId, page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(`/reviews/user?page=${page}&limit=${limit}`);
    return {
      success: true,
      reviews: response.data.data,
      total: response.data.data.length,
      currentPage: page,
      totalPages: Math.ceil(response.data.data.length / limit)
    };
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch user reviews'
    };
  }
};
