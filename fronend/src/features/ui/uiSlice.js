import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sidebarOpen: true,
  mobileSidebarOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    openMobileSidebar: (state) => {
      state.mobileSidebarOpen = true;
    },

    closeMobileSidebar: (state) => {
      state.mobileSidebarOpen = false;
    },
  },
});

export const {
  toggleSidebar,
  openMobileSidebar,
  closeMobileSidebar,
  toggleTheme,
  setTheme,
} = uiSlice.actions;

export default uiSlice.reducer;