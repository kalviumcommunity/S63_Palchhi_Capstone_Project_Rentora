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
    // The backend exposes searching via GET /listings with query params.
    // Use axios params to let axios build the query string correctly.
    const params = {};
    Object.keys(searchParams || {}).forEach(key => {
      const val = searchParams[key];
      if (val !== undefined && val !== null && val !== '') params[key] = val;
    });

    const response = await axiosInstance.get('/listings', { params });
    return response.data;
  } catch (error) {
    console.error('Error searching listings:', error);
    throw error;
  }
};

// Backwards-compatible alias: some components import `getListings`.
// Map it to `searchListings` which accepts filters and returns matching listings.
export const getListings = searchListings;
