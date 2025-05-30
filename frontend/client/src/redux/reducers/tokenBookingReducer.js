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

const initialState = {
  bookings: [],
  currentBooking: null,
  loading: false,
  error: null
};

export const tokenBookingReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_TOKEN_BOOKING_REQUEST:
    case GET_USER_TOKEN_BOOKINGS_REQUEST:
    case GET_TOKEN_BOOKING_REQUEST:
    case UPDATE_TOKEN_BOOKING_STATUS_REQUEST:
    case CANCEL_TOKEN_BOOKING_REQUEST:
    case UPLOAD_PAYMENT_PROOF_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case CREATE_TOKEN_BOOKING_SUCCESS:
      return {
        ...state,
        loading: false,
        bookings: [...state.bookings, action.payload]
      };

    case GET_USER_TOKEN_BOOKINGS_SUCCESS:
      return {
        ...state,
        loading: false,
        bookings: action.payload
      };

    case GET_TOKEN_BOOKING_SUCCESS:
      return {
        ...state,
        loading: false,
        currentBooking: action.payload
      };

    case UPDATE_TOKEN_BOOKING_STATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        currentBooking: action.payload,
        bookings: state.bookings.map((booking) =>
          booking._id === action.payload._id ? action.payload : booking
        )
      };

    case CANCEL_TOKEN_BOOKING_SUCCESS:
      return {
        ...state,
        loading: false,
        currentBooking: action.payload,
        bookings: state.bookings.map((booking) =>
          booking._id === action.payload._id ? action.payload : booking
        )
      };

    case UPLOAD_PAYMENT_PROOF_SUCCESS:
      return {
        ...state,
        loading: false,
        currentBooking: action.payload,
        bookings: state.bookings.map((booking) =>
          booking._id === action.payload._id ? action.payload : booking
        )
      };

    case CREATE_TOKEN_BOOKING_FAIL:
    case GET_USER_TOKEN_BOOKINGS_FAIL:
    case GET_TOKEN_BOOKING_FAIL:
    case UPDATE_TOKEN_BOOKING_STATUS_FAIL:
    case CANCEL_TOKEN_BOOKING_FAIL:
    case UPLOAD_PAYMENT_PROOF_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    default:
      return state;
  }
}; 