import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "../features/ui/uiSlice";
import authReducer from "../features/auth/authSlice";
import profileReducer from "../features/proflie/profileSlice";
import dashboardReducer from "../features/dashbboard/dashboardSlice"
import eventsReducer from '../features/event/eventSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    profile: profileReducer,
    dashboard: dashboardReducer,
    events: eventsReducer,
  },
});

export default store;