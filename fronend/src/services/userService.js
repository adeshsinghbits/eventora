import api from "../utils/axioInstance";

// register
export const registerUser = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData); 
    return response.data;
  } catch (error) {
    throw error;
  }
};

// login
export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);  
    return response.data;
  } catch (error) {
    throw error;
  }
};

// logout
export const logoutUser = async () => {
  try {
    await api.post("/auth/logout"); 
  } catch (error) {
    throw error;
  }
};

// Get User Profile
export const getProfile = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
    
  } catch (error) {
    
    throw error;
  }
};

// change password
export const changePassword = async (passwordData) => {
  try {
    const response = await api.post("/auth/change-password", passwordData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// forgot password
export const forgotPassword = async (email) => {
  try {
    const response = await api.post("/auth/forgot-password", { email }); 
    return response.data;
  } catch (error) {
    throw error;
  }
};

// reset password
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post("/auth/reset-password", { token, newPassword });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get User Profile
export const getUserProfileService = async (id) => {
  const res = await api.get(`/users/profile/${id}`);
  return res.data;
};

// Update User Profile
export const updateUserProfileService = async (formData) => {
  const res = await api.put(`/users/profile/update`, formData);
  return res.data;
};

// Upload Avatar
export const uploadAvatarService = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await api.post(`/users/profile/avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

// Follow User
export const followUserService = async (id) => {
  const res = await api.post(`/users/${id}/follow`);
  return res.data;
};

// Unfollow User
export const unfollowUserService = async (id) => {
  const res = await api.post(`/users/${id}/unfollow`);
  return res.data;
};

// Get Followers
export const getUserFollowersService = async (
  id,
  page = 1,
  limit = 10
) => {
  const res = await api.get(
    `/users/${id}/followers?page=${page}&limit=${limit}`
  );
  return res.data;
};

// Get Following
export const getUserFollowingService = async (
  id,
  page = 1,
  limit = 10
) => {
  const res = await api.get(
    `/users/${id}/following?page=${page}&limit=${limit}`
  );
  return res.data;
};

// Delete Account
export const deleteUserAccountService = async (password) => {
  const res = await api.delete(`/users/profile/delete`, {
    data: { password },
  });

  return res.data;
};

// Search Users
export const searchUsersService = async (
  query,
  page = 1,
  limit = 10
) => {
  const res = await api.get(
    `/users/search?q=${query}&page=${page}&limit=${limit}`
  );

  return res.data;
};