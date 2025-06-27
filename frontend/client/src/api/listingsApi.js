import axiosInstance from '../utils/axiosConfig';

export const getListings = async (page = 1, filters = {}) => {
  try {
    const response = await axiosInstance.get('/listings', {
      params: {
        page,
        limit: 10,
        ...filters
      }
    });

    // Ensure the response has the expected format
    if (!response.data) {
      throw new Error('Invalid response: no data received');
    }

    // Return the response data with success flag
    return {
      success: true,
      data: response.data.data || [],
      pagination: response.data.pagination || {
        page: 1,
        pages: 1,
        total: 0
      }
    };
  } catch (error) {
    console.error('Error fetching listings:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch listings'
    };
  }
};

export const getListingById = async (id) => {
  try {
    const response = await axiosInstance.get(`/listings/${id}`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error(`Error fetching listing ${id}:`, error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch listing'
    };
  }
};

export const createListing = async (listingData) => {
  try {
    const response = await axiosInstance.post('/listings', listingData);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error creating listing:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create listing'
    };
  }
};

export const updateListing = async (id, listingData) => {
  try {
    const response = await axiosInstance.put(`/listings/${id}`, listingData);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error(`Error updating listing ${id}:`, error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update listing'
    };
  }
};

export const deleteListing = async (id) => {
  try {
    const response = await axiosInstance.delete(`/listings/${id}`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error(`Error deleting listing ${id}:`, error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete listing'
    };
  }
};

export const searchListings = async (searchQuery, filters = {}, page = 1, limit = 10) => {
  try {
    const queryParams = new URLSearchParams({
      search: searchQuery,
      page,
      limit,
      ...filters
    }).toString();

    const response = await axiosInstance.get(`/listings/search?${queryParams}`);
    return {
      success: true,
      data: response.data.data || [],
      pagination: response.data.pagination || {
        page: 1,
        pages: 1,
        total: 0
      }
    };
  } catch (error) {
    console.error('Error searching listings:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to search listings'
    };
  }
};
