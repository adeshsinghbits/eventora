import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { updateUserProfileService, uploadAvatarService, followUserService, unfollowUserService, getUserFollowersService, getUserFollowingService,  } from '../../services/userService';


export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const { data } = await updateUserProfileService(profileData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'profile/uploadAvatar',
  async (file, { rejectWithValue }) => {
    try {
        const { data } = await uploadAvatarService(file);
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to upload avatar');
    }
  }
);

export const followUser = createAsyncThunk(
  'profile/followUser',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await followUserService(userId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to follow user');
    }
  }
);

export const unfollowUser = createAsyncThunk(
  'profile/unfollowUser',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await unfollowUserService(userId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unfollow user');
    }
  }
);

export const getFollowers = createAsyncThunk(
  'profile/getFollowers',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await getUserFollowersService(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getFollowing = createAsyncThunk(
  'profile/getFollowing',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await getUserFollowingService(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const initialState = {
  followers: [],
  following: [],
  loading: false,
  uploading: false,
  error: null,
  success: false,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
  // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Upload Avatar
    builder
      .addCase(uploadAvatar.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.uploading = false;
        state.success = true;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      });

    // Follow User
    builder
      .addCase(followUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.success = true;
      })
      .addCase(followUser.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Unfollow User
    builder
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.success = true;
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Get Followers
    builder
      .addCase(getFollowers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFollowers.fulfilled, (state, action) => {
        state.loading = false;
        state.followers = action.payload;
      })
      .addCase(getFollowers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Following
    builder
      .addCase(getFollowing.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFollowing.fulfilled, (state, action) => {
        state.loading = false;
        state.following = action.payload;
      })
      .addCase(getFollowing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = profileSlice.actions;
export default profileSlice.reducer;