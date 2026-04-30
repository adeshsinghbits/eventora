import { createSlice } from "@reduxjs/toolkit";
import { register, login, logout, fetchProfile, changeUserPassword, forgotUserPassword } from "./authThunks";

const initialState = {
  user: null,
  loading: false,
  error: null,
  isAuthChecked: false,
  isLoggedIn: false, 
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isLoggedIn = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
        builder
            .addCase(logout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.isLoggedIn = false;
            })
            .addCase(logout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
        builder
            .addCase(fetchProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthChecked = true;
                state.isLoggedIn = true;
            })
            .addCase(fetchProfile.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthChecked = true;
                state.isLoggedIn = false;
            });
        builder
            .addCase(changeUserPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(changeUserPassword.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(changeUserPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload
            });
        builder
            .addCase(forgotUserPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(forgotUserPassword.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(forgotUserPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default authSlice.reducer;