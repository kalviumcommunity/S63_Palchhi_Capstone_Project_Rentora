import { combineReducers } from 'redux';
import { tokenBookingReducer } from './tokenBookingReducer';

const rootReducer = combineReducers({
  tokenBooking: tokenBookingReducer,
  // ... existing reducers ...
});

export default rootReducer; 