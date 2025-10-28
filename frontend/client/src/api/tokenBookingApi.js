import axiosInstance from '../utils/axiosConfig';
import { API_URL } from '../config';

export const uploadPaymentProof = async (bookingId, formData, onProgress) => {
  try {
    // Log the request details for debugging
    console.log('Uploading payment proof:', {
      bookingId,
      formData: Object.fromEntries(formData.entries()),
      url: `${API_URL}/token-bookings/${bookingId}/payment-proof`
    });

    const response = await axiosInstance.post(
      `/token-bookings/${bookingId}/payment-proof`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        // Add timeout and validate status
        timeout: 30000,
        validateStatus: (status) => status >= 200 && status < 300,
        onUploadProgress: onProgress ? (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        } : undefined
      }
    );

    console.log('Payment proof upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error uploading payment proof:', {
      error,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });

    if (error.response?.status === 403) {
      throw new Error('You are not authorized to upload payment proof for this booking. Please ensure you are logged in and have the correct permissions.');
    } else if (error.response?.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    } else if (error.response?.status === 413) {
      throw new Error('The file size is too large. Please upload a smaller file.');
    } else if (error.response?.status === 415) {
      throw new Error('Invalid file type. Please upload a valid image file (JPG, PNG, or PDF).');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('The upload timed out. Please try again.');
    } else if (!error.response) {
      throw new Error('Network error. Please check your internet connection.');
    }

    throw new Error(error.response?.data?.message || 'Failed to upload payment proof. Please try again.');
  }
};

export const getAllTokenBookings = async (page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(`/token-bookings?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching token bookings:', error);
    throw error;
  }
};

export const getTokenBookingById = async (id) => {
  try {
    const response = await axiosInstance.get(`/token-bookings/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching token booking ${id}:`, error);
    throw error;
  }
};

export const createTokenBooking = async (bookingData) => {
  try {
    const response = await axiosInstance.post('/token-bookings', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error creating token booking:', error);
    throw error;
  }
};

export const updateTokenBooking = async (id, bookingData) => {
  try {
    const response = await axiosInstance.put(`/token-bookings/${id}`, bookingData);
    return response.data;
  } catch (error) {
    console.error(`Error updating token booking ${id}:`, error);
    throw error;
  }
};

export const deleteTokenBooking = async (id) => {
  try {
    const response = await axiosInstance.delete(`/token-bookings/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting token booking ${id}:`, error);
    throw error;
  }
}; 