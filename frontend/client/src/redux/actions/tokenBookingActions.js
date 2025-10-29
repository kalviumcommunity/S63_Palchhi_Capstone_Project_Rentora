import axiosInstance from '../../utils/axiosConfig';
import { API_URL } from '../../config';
import {
  CREATE_TOKEN_BOOKING_REQUEST,
  CREATE_TOKEN_BOOKING_SUCCESS,
  CREATE_TOKEN_BOOKING_FAIL,
  GET_TOKEN_BOOKINGS_REQUEST,
  GET_TOKEN_BOOKINGS_SUCCESS,
  GET_TOKEN_BOOKINGS_FAIL,
  GET_TOKEN_BOOKING_DETAILS_REQUEST,
  GET_TOKEN_BOOKING_DETAILS_SUCCESS,
  GET_TOKEN_BOOKING_DETAILS_FAIL,
  UPDATE_TOKEN_BOOKING_STATUS_REQUEST,
  UPDATE_TOKEN_BOOKING_STATUS_SUCCESS,
  UPDATE_TOKEN_BOOKING_STATUS_FAIL,
  CANCEL_TOKEN_BOOKING_REQUEST,
  CANCEL_TOKEN_BOOKING_SUCCESS,
  CANCEL_TOKEN_BOOKING_FAIL,
  UPLOAD_PAYMENT_PROOF_REQUEST,
  UPLOAD_PAYMENT_PROOF_SUCCESS,
  UPLOAD_PAYMENT_PROOF_FAIL,
  CLEAR_ERRORS
} from '../constants/tokenBookingConstants';

export const createTokenBooking = (bookingData) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_TOKEN_BOOKING_REQUEST });

    const { data } = await axiosInstance.post('/token-bookings', bookingData);

    dispatch({
      type: CREATE_TOKEN_BOOKING_SUCCESS,
      payload: data
    });

    return data;
  } catch (error) {
    dispatch({
      type: CREATE_TOKEN_BOOKING_FAIL,
      payload: error.response?.data?.message || 'Failed to create booking'
    });
    throw error;
  }
};

export const getTokenBookings = () => async (dispatch) => {
  try {
    dispatch({ type: GET_TOKEN_BOOKINGS_REQUEST });

    const { data } = await axiosInstance.get('/token-bookings/my-bookings');

    dispatch({
      type: GET_TOKEN_BOOKINGS_SUCCESS,
      payload: data
    });

    return data;
  } catch (error) {
    dispatch({
      type: GET_TOKEN_BOOKINGS_FAIL,
      payload: error.response?.data?.message || 'Failed to fetch bookings'
    });
    throw error;
  }
};

export const getTokenBookingDetails = (id) => async (dispatch) => {
  try {
    dispatch({ type: GET_TOKEN_BOOKING_DETAILS_REQUEST });

    const { data } = await axiosInstance.get(`/token-bookings/${id}`);

    dispatch({
      type: GET_TOKEN_BOOKING_DETAILS_SUCCESS,
      payload: data
    });

    return data;
  } catch (error) {
    dispatch({
      type: GET_TOKEN_BOOKING_DETAILS_FAIL,
      payload: error.response?.data?.message || 'Failed to fetch booking details'
    });
    throw error;
  }
};

export const updateTokenBookingStatus = (id, status) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_TOKEN_BOOKING_STATUS_REQUEST });

    const { data } = await axiosInstance.patch(`/token-bookings/${id}/status`, { status });

    dispatch({
      type: UPDATE_TOKEN_BOOKING_STATUS_SUCCESS,
      payload: data
    });

    return data;
  } catch (error) {
    dispatch({
      type: UPDATE_TOKEN_BOOKING_STATUS_FAIL,
      payload: error.response?.data?.message || 'Failed to update booking status'
    });
    throw error;
  }
};

export const cancelTokenBooking = (id, reason) => async (dispatch) => {
  try {
    dispatch({ type: CANCEL_TOKEN_BOOKING_REQUEST });

    const response = await axiosInstance.post(`/token-bookings/${id}/cancel`, {
      reason
    });

    dispatch({
      type: CANCEL_TOKEN_BOOKING_SUCCESS,
      payload: response.data
    });

    return response.data;
  } catch (error) {
    dispatch({
      type: CANCEL_TOKEN_BOOKING_FAIL,
      payload: error.response?.data?.message || 'Failed to cancel booking'
    });
    throw error;
  }
};

export const uploadPaymentProof = (bookingId, formData, onProgress) => async (dispatch) => {
  try {
    dispatch({ type: UPLOAD_PAYMENT_PROOF_REQUEST });

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
          'Content-Type': 'multipart/form-data'
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

    dispatch({
      type: UPLOAD_PAYMENT_PROOF_SUCCESS,
      payload: response.data
    });

    return response.data;
  } catch (error) {
    console.error('Payment proof upload error:', error);
    dispatch({
      type: UPLOAD_PAYMENT_PROOF_FAIL,
      payload: error.response?.data?.message || 'Failed to upload payment proof'
    });
    throw error;
  }
};

export const clearErrors = () => async (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });
}; 

// Backwards-compatible alias: some components import `getUserTokenBookings`
// Map it to the existing `getTokenBookings` action.
export const getUserTokenBookings = getTokenBookings;