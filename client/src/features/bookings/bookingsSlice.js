import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bookings: [],
  booking: null,
  isLoading: false,
  error: null,
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearBookingError: (state) => {
      state.error = null;
    },
  },
});

export const { clearBookingError } = bookingsSlice.actions;
export default bookingsSlice.reducer;
