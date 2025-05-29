import axiosInstance from '../utils/axiosConfig';

export const getListings = async (filters = {}, page = 1, limit = 10) => {
  try {
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...filters
    }).toString();

    const response = await axiosInstance.get(`/listings?${queryParams}`);
    return {
      success: true,
      listings: response.data.data,
      total: response.data.pagination.total,
      currentPage: response.data.pagination.page,
      totalPages: response.data.pagination.pages
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
      listing: response.data.listing
    };
  } catch (error) {
    console.error('Error fetching listing:', error);
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
      listing: response.data.listing
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
      listing: response.data.listing
    };
  } catch (error) {
    console.error('Error updating listing:', error);
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
      success: true
    };
  } catch (error) {
    console.error('Error deleting listing:', error);
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
      listings: response.data.listings,
      total: response.data.total,
      currentPage: response.data.currentPage,
      totalPages: response.data.totalPages
    };
  } catch (error) {
    console.error('Error searching listings:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to search listings'
    };
  }
};
