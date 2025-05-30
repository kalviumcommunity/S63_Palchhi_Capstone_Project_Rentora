import { createStore, combineReducers, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import { tokenBookingReducer } from './reducers/tokenBookingReducer';

const rootReducer = combineReducers({
  tokenBooking: tokenBookingReducer,
  // Add other reducers here as needed
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store; 