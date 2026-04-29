import { createSlice } from "@reduxjs/toolkit";
import { register, login, logout, fetchProfile, changeUserPassword, forgotUserPassword } from "./authThunks";

const initialState = {
    user: null,
    loading: false,
    error: null,
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
                toast.error("Registration failed");
            });
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error("Login failed");
            });
        builder
            .addCase(logout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
            })
            .addCase(logout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error("Logout failed");
            });
        builder
            .addCase(fetchProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error("Failed to fetch profile");
            });
        builder
            .addCase(changeUserPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(changeUserPassword.fulfilled, (state) => {
                state.loading = false;
                toast.success("Password changed successfully");
            })
            .addCase(changeUserPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error("Failed to change password");
            });
        builder
            .addCase(forgotUserPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(forgotUserPassword.fulfilled, (state) => {
                state.loading = false;
                toast.success("Password reset link sent successfully");
            })
            .addCase(forgotUserPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error("Failed to send password reset link");
            });
    },
});

export default authSlice.reducer;