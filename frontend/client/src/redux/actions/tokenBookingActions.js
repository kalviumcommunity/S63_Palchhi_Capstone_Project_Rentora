import axiosInstance from '../../utils/axiosConfig';
import {
  CREATE_TOKEN_BOOKING_REQUEST,
  CREATE_TOKEN_BOOKING_SUCCESS,
  CREATE_TOKEN_BOOKING_FAIL,
  GET_USER_TOKEN_BOOKINGS_REQUEST,
  GET_USER_TOKEN_BOOKINGS_SUCCESS,
  GET_USER_TOKEN_BOOKINGS_FAIL,
  GET_TOKEN_BOOKING_REQUEST,
  GET_TOKEN_BOOKING_SUCCESS,
  GET_TOKEN_BOOKING_FAIL,
  UPDATE_TOKEN_BOOKING_STATUS_REQUEST,
  UPDATE_TOKEN_BOOKING_STATUS_SUCCESS,
  UPDATE_TOKEN_BOOKING_STATUS_FAIL,
  CANCEL_TOKEN_BOOKING_REQUEST,
  CANCEL_TOKEN_BOOKING_SUCCESS,
  CANCEL_TOKEN_BOOKING_FAIL,
  UPLOAD_PAYMENT_PROOF_REQUEST,
  UPLOAD_PAYMENT_PROOF_SUCCESS,
  UPLOAD_PAYMENT_PROOF_FAIL
} from '../constants/tokenBookingConstants';

export const createTokenBooking = (bookingData) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_TOKEN_BOOKING_REQUEST });

    const { data } = await axiosInstance.post('/token-bookings', bookingData);

    dispatch({
      type: CREATE_TOKEN_BOOKING_SUCCESS,
      payload: data.data
    });
  } catch (error) {
    dispatch({
      type: CREATE_TOKEN_BOOKING_FAIL,
      payload: error.response?.data?.message || 'Error creating token booking'
    });
    throw error;
  }
};

export const getUserTokenBookings = () => async (dispatch) => {
  try {
    dispatch({ type: GET_USER_TOKEN_BOOKINGS_REQUEST });

    const { data } = await axiosInstance.get('/token-bookings/my-bookings');

    dispatch({
      type: GET_USER_TOKEN_BOOKINGS_SUCCESS,
      payload: data.data
    });
  } catch (error) {
    dispatch({
      type: GET_USER_TOKEN_BOOKINGS_FAIL,
      payload: error.response?.data?.message || 'Error fetching token bookings'
    });
  }
};

export const getTokenBooking = (id) => async (dispatch) => {
  try {
    dispatch({ type: GET_TOKEN_BOOKING_REQUEST });

    const { data } = await axiosInstance.get(`/token-bookings/${id}`);

    dispatch({
      type: GET_TOKEN_BOOKING_SUCCESS,
      payload: data.data
    });
  } catch (error) {
    dispatch({
      type: GET_TOKEN_BOOKING_FAIL,
      payload: error.response?.data?.message || 'Error fetching token booking'
    });
  }
};

export const updateTokenBookingStatus = (id, status) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_TOKEN_BOOKING_STATUS_REQUEST });

    const { data } = await axiosInstance.patch(`/token-bookings/${id}/status`, { status });

    dispatch({
      type: UPDATE_TOKEN_BOOKING_STATUS_SUCCESS,
      payload: data.data
    });
  } catch (error) {
    dispatch({
      type: UPDATE_TOKEN_BOOKING_STATUS_FAIL,
      payload: error.response?.data?.message || 'Error updating token booking status'
    });
    throw error;
  }
};

export const cancelTokenBooking = (id, reason) => async (dispatch) => {
  try {
    dispatch({ type: CANCEL_TOKEN_BOOKING_REQUEST });

    const { data } = await axiosInstance.post(`/token-bookings/${id}/cancel`, { reason });

    dispatch({
      type: CANCEL_TOKEN_BOOKING_SUCCESS,
      payload: data.data
    });
  } catch (error) {
    dispatch({
      type: CANCEL_TOKEN_BOOKING_FAIL,
      payload: error.response?.data?.message || 'Error cancelling token booking'
    });
    throw error;
  }
};

export const uploadPaymentProof = (id, formData) => async (dispatch) => {
  try {
    dispatch({ type: UPLOAD_PAYMENT_PROOF_REQUEST });

    const { data } = await axiosInstance.post(
      `/token-bookings/${id}/payment-proof`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    dispatch({
      type: UPLOAD_PAYMENT_PROOF_SUCCESS,
      payload: data.data
    });
  } catch (error) {
    dispatch({
      type: UPLOAD_PAYMENT_PROOF_FAIL,
      payload: error.response?.data?.message || 'Error uploading payment proof'
    });
    throw error;
  }
}; 