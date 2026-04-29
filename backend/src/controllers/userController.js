import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryUtils.js";
import { validateEmail, validateURL } from "../utils/validators.js";

//route   GET /api/users/profile/:id
export const getUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select("-password -refreshToken -emailVerifyToken -resetPasswordToken")
    .populate([
      { path: "createdEvents", select: "title description image eventDate" },
      { path: "attendingEvents", select: "title description image eventDate" },
      { path: "followers", select: "fullName username avatar" },
      { path: "following", select: "fullName username avatar" },
    ]);

  if (!user) {
    return errorResponse(res, 404, "User not found");
  }

  if (user.isDeleted) {
    return errorResponse(res, 404, "User account has been deleted");
  }

  return successResponse(res, 200, "User profile fetched successfully", { user });
});


//route   PUT /api/users/profile/update
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { fullName, bio, phone, website, city, state, country, interests } = req.body;
  const userId = req.userId;

  const updateData = {};

  if (fullName) {
    if (fullName.length < 2 || fullName.length > 80) {
      return errorResponse(res, 400, "Full name must be between 2 and 80 characters");
    }
    updateData.fullName = fullName;
  }

  if (bio !== undefined) {
    if (bio.length > 300) {
      return errorResponse(res, 400, "Bio cannot exceed 300 characters");
    }
    updateData.bio = bio;
  }

  if (phone) {
    updateData.phone = phone;
  }

  if (website) {
    if (!validateURL(website)) {
      return errorResponse(res, 400, "Invalid website URL");
    }
    updateData.website = website;
  }

  if (city) updateData.city = city;
  if (state) updateData.state = state;
  if (country) updateData.country = country;

  if (interests && Array.isArray(interests)) {
    updateData.interests = interests;
  }

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  return successResponse(res, 200, "Profile updated successfully", { user });
});

//route   POST /api/users/profile/avatar
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 400, "Please upload an image");
  }

  const user = await User.findById(req.userId);

  if (user.avatar?.public_id) {
    await deleteFromCloudinary(user.avatar.public_id);
  }

  const uploadedAvatar = await uploadToCloudinary(req.file.buffer, "event-management/avatars");

  user.avatar = {
    url: uploadedAvatar.url,
    public_id: uploadedAvatar.public_id,
  };

  await user.save();

  return successResponse(res, 200, "Avatar uploaded successfully", {
    user: user.toJSON(),
  });
});

//route   POST /api/users/:id/follow
export const followUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  if (id === userId.toString()) {
    return errorResponse(res, 400, "You cannot follow yourself");
  }

  const userToFollow = await User.findById(id);
  if (!userToFollow) {
    return errorResponse(res, 404, "User not found");
  }

  const currentUser = await User.findById(userId);

  if (currentUser.following.includes(id)) {
    return errorResponse(res, 400, "You are already following this user");
  }

  currentUser.following.push(id);
  userToFollow.followers.push(userId);

  await currentUser.save();
  await userToFollow.save();

  return successResponse(res, 200, "User followed successfully");
});

//route   POST /api/users/:id/unfollow
export const unfollowUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const userToUnfollow = await User.findById(id);
  if (!userToUnfollow) {
    return errorResponse(res, 404, "User not found");
  }

  const currentUser = await User.findById(userId);

  if (!currentUser.following.includes(id)) {
    return errorResponse(res, 400, "You are not following this user");
  }

  currentUser.following = currentUser.following.filter((uid) => uid.toString() !== id);
  userToUnfollow.followers = userToUnfollow.followers.filter((uid) => uid.toString() !== userId);

  await currentUser.save();
  await userToUnfollow.save();

  return successResponse(res, 200, "User unfollowed successfully");
});

//route   GET /api/users/:id/followers
export const getUserFollowers = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const user = await User.findById(id)
    .populate({
      path: "followers",
      select: "fullName username avatar bio",
      options: {
        skip: (page - 1) * limit,
        limit: parseInt(limit),
      },
    });

  if (!user) {
    return errorResponse(res, 404, "User not found");
  }

  const totalFollowers = user.followers.length;

  return successResponse(res, 200, "Followers fetched successfully", {
    followers: user.followers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalFollowers,
      pages: Math.ceil(totalFollowers / limit),
    },
  });
});

//route   GET /api/users/:id/following
export const getUserFollowing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const user = await User.findById(id)
    .populate({
      path: "following",
      select: "fullName username avatar bio",
      options: {
        skip: (page - 1) * limit,
        limit: parseInt(limit),
      },
    });

  if (!user) {
    return errorResponse(res, 404, "User not found");
  }

  const totalFollowing = user.following.length;

  return successResponse(res, 200, "Following fetched successfully", {
    following: user.following,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalFollowing,
      pages: Math.ceil(totalFollowing / limit),
    },
  });
});

//route   DELETE /api/users/profile/delete
export const deleteUserAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return errorResponse(res, 400, "Please provide your password");
  }

  const user = await User.findById(req.userId).select("+password");

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return errorResponse(res, 401, "Incorrect password");
  }

  if (user.avatar?.public_id) {
    await deleteFromCloudinary(user.avatar.public_id);
  }
  if (user.coverImage?.public_id) {
    await deleteFromCloudinary(user.coverImage.public_id);
  }

  user.isDeleted = true;
  await user.save();

  return successResponse(res, 200, "Account deleted successfully");
});

//route   GET /api/users/search?q=searchTerm
export const searchUsers = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;

  if (!q) {
    return errorResponse(res, 400, "Please provide search query");
  }

  const skip = (page - 1) * limit;

  const users = await User.find({
    $and: [
      { isDeleted: false },
      {
        $or: [
          { fullName: { $regex: q, $options: "i" } },
          { username: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
        ],
      },
    ],
  })
    .select("-password -refreshToken")
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments({
    $and: [
      { isDeleted: false },
      {
        $or: [
          { fullName: { $regex: q, $options: "i" } },
          { username: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
        ],
      },
    ],
  });

  return successResponse(res, 200, "Users found", {
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});