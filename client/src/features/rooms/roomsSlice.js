import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  rooms: [],
  room: null,
  availableRooms: [],
  categories: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
  },
};

const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    clearRoomError: (state) => {
      state.error = null;
    },
  },
});

export const { clearRoomError } = roomsSlice.actions;
export default roomsSlice.reducer;
