import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "../features/ui/uiSlice";
import authReducer from "../features/auth/authSlice";
import dashboardReducer from "../features/dashbboard/dashboardSlice"

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    dashboard: dashboardReducer,
  },
});

export default store;