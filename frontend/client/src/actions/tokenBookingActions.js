import axiosInstance from '../api/axiosConfig';
import { API_URL } from '../config';

// Action Types
export const UPLOAD_PAYMENT_PROOF_REQUEST = 'UPLOAD_PAYMENT_PROOF_REQUEST';
export const UPLOAD_PAYMENT_PROOF_SUCCESS = 'UPLOAD_PAYMENT_PROOF_SUCCESS';
export const UPLOAD_PAYMENT_PROOF_FAILURE = 'UPLOAD_PAYMENT_PROOF_FAILURE';

// Action Creators
export const uploadPaymentProofRequest = () => ({
  type: UPLOAD_PAYMENT_PROOF_REQUEST
});

export const uploadPaymentProofSuccess = (data) => ({
  type: UPLOAD_PAYMENT_PROOF_SUCCESS,
  payload: data
});

export const uploadPaymentProofFailure = (error) => ({
  type: UPLOAD_PAYMENT_PROOF_FAILURE,
  payload: error
});

// Thunk Action Creator
export const uploadPaymentProof = (bookingId, formData) => async (dispatch) => {
  try {
    dispatch(uploadPaymentProofRequest());

    // Get the token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }

    // Log the request details for debugging
    console.log('Uploading payment proof:', {
      bookingId,
      formData: Object.fromEntries(formData.entries()),
      url: `${API_URL}/api/token-bookings/${bookingId}/payment-proof`
    });

    const response = await axiosInstance.post(
      `/api/token-bookings/${bookingId}/payment-proof`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 30000,
        validateStatus: (status) => status >= 200 && status < 300
      }
    );

    console.log('Payment proof upload response:', response.data);

    if (response.data.success) {
      dispatch(uploadPaymentProofSuccess(response.data));
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to upload payment proof');
    }
  } catch (error) {
    console.error('Error uploading payment proof:', {
      error,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });

    let errorMessage = 'Failed to upload payment proof. Please try again.';

    if (error.response?.status === 403) {
      errorMessage = 'You are not authorized to upload payment proof for this booking. Please ensure you are logged in and have the correct permissions.';
    } else if (error.response?.status === 401) {
      errorMessage = 'Your session has expired. Please log in again.';
      // Clear tokens and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    } else if (error.response?.status === 413) {
      errorMessage = 'The file size is too large. Please upload a smaller file.';
    } else if (error.response?.status === 415) {
      errorMessage = 'Invalid file type. Please upload a valid image file (JPG, PNG, or PDF).';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'The upload timed out. Please try again.';
    } else if (!error.response) {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    dispatch(uploadPaymentProofFailure(errorMessage));
    throw new Error(errorMessage);
  }
};

// Other token booking actions...
export const getTokenBookings = () => async (dispatch) => {
  try {
    const response = await axiosInstance.get('/api/token-bookings');
    return response.data;
  } catch (error) {
    console.error('Error fetching token bookings:', error);
    throw error;
  }
};

export const getTokenBookingById = (id) => async (dispatch) => {
  try {
    const response = await axiosInstance.get(`/api/token-bookings/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching token booking ${id}:`, error);
    throw error;
  }
};

export const createTokenBooking = (bookingData) => async (dispatch) => {
  try {
    const response = await axiosInstance.post('/api/token-bookings', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error creating token booking:', error);
    throw error;
  }
};

export const updateTokenBooking = (id, bookingData) => async (dispatch) => {
  try {
    const response = await axiosInstance.put(`/api/token-bookings/${id}`, bookingData);
    return response.data;
  } catch (error) {
    console.error(`Error updating token booking ${id}:`, error);
    throw error;
  }
};

export const deleteTokenBooking = (id) => async (dispatch) => {
  try {
    const response = await axiosInstance.delete(`/api/token-bookings/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting token booking ${id}:`, error);
    throw error;
  }
}; 