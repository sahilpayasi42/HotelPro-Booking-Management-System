import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import roomsReducer from '../features/rooms/roomsSlice';
import bookingsReducer from '../features/bookings/bookingsSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    rooms: roomsReducer,
    bookings: bookingsReducer,
    notifications: notificationsReducer,
  },
});

export default store;
