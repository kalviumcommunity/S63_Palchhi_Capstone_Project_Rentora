import axiosInstance from '../utils/axiosConfig';

export const getAllListings = async (page = 1, limit = 10, filters = {}) => {
  try {
    const response = await axiosInstance.get('/listings', {
      params: {
        page,
        limit,
        ...filters
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }
};

export const getListingById = async (id) => {
  try {
    const response = await axiosInstance.get(`/listings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching listing:', error);
    throw error;
  }
};

export const createListing = async (listingData) => {
  try {
    const response = await axiosInstance.post('/listings', listingData);
    return response.data;
  } catch (error) {
    console.error('Error creating listing:', error);
    throw error;
  }
};

export const updateListing = async (id, listingData) => {
  try {
    const response = await axiosInstance.put(`/listings/${id}`, listingData);
    return response.data;
  } catch (error) {
    console.error('Error updating listing:', error);
    throw error;
  }
};

export const deleteListing = async (id) => {
  try {
    const response = await axiosInstance.delete(`/listings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting listing:', error);
    throw error;
  }
};

export const searchListings = async (searchParams) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add search parameters
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key] !== undefined && searchParams[key] !== null && searchParams[key] !== '') {
        queryParams.append(key, searchParams[key]);
      }
    });
    
    const response = await axiosInstance.get(`/listings/search?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error searching listings:', error);
    throw error;
  }
};
