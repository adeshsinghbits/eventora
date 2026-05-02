import { createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from "react-hot-toast";
import { registerUser, loginUser, logoutUser, getProfile, changePassword, forgotPassword } from '../../services/userService';

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
    try {
        const response = await registerUser(userData);
        toast.success("Registration successful! Please log in.");
        return response;
    } catch (error) {
        toast.error(error.response.data.message || error.response.data || "Registration failed.");
        return rejectWithValue(error.response.data);
    }
});

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const response = await loginUser(credentials);
        toast.success("Login successful!");
        return response;
    } catch (error) {
        toast.error(error.response.data.message || error.response.data || "login failed.");
        return rejectWithValue(error.response.data);
    }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
    try {
        await logoutUser();
        toast.success("You have been logged out.");
    } catch (error) {
        toast.error(error.response.data.message || error.response.data || "Logout failed.");
        return rejectWithValue(error.response.data);
    }
});

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
    try {
        const response = await getProfile();
        return response.data.user;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const changeUserPassword = createAsyncThunk('auth/changePassword', async (passwordData, { rejectWithValue }) => {
    try {
        const response = await changePassword(passwordData);
        toast.success("Password changed successfully.");
        return response;
    } catch (error) {
        toast.error(error.response.data.message || error.response.data || "Failed to change password.");
        return rejectWithValue(error.response.data);
    }
});

export const forgotUserPassword = createAsyncThunk('auth/forgotPassword', async (email, { rejectWithValue }) => {
    try {
        const response = await forgotPassword(email);
        toast.success("Password reset link sent successfully.");
        return response;
    } catch (error) {
        toast.error(error.response.data.message || error.response.data || "Failed to send password reset link.");
        return rejectWithValue(error.response.data);
    }
});
