import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/tokenUtils.js";
import {
  validateEmail,
  validatePassword,
  validateUsername,
  validateFullName,
  sanitizeInput,
} from "../utils/validators.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";
import dayjs from "dayjs";

//route = POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, confirmPassword, username } = req.body;

  if (!fullName || !email || !password || !confirmPassword) {
    return errorResponse(res, 400, "Please provide all required fields");
  }

  if (!validateFullName(fullName)) {
    return errorResponse(res, 400, "Full name must be between 2 and 80 characters");
  }

  if (!validateEmail(email)) {
    return errorResponse(res, 400, "Please provide a valid email address");
  }

  if (!validatePassword(password)) {
    return errorResponse(
      res,
      400,
      "Password must be at least 6 characters and contain uppercase, lowercase, and numbers"
    );
  }

  if (password !== confirmPassword) {
    return errorResponse(res, 400, "Passwords do not match");
  }

  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username: username?.toLowerCase() }],
  });

  if (existingUser) {
    const field = existingUser.email === email.toLowerCase() ? "email" : "username";
    return errorResponse(res, 400, `User with this ${field} already exists`);
  }

  const user = new User({
    fullName: sanitizeInput(fullName),
    email: email.toLowerCase(),
    password, 
    username: username ? sanitizeInput(username.toLowerCase()) : null,
    provider: "local",
  });

  await user.save();

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: parseInt(process.env.COOKIE_MAX_AGE) || 7 * 24 * 60 * 60 * 1000,
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, cookieOptions);

  const userResponse = user.toJSON();

  return successResponse(res, 201, "User registered successfully", {
    user: userResponse,
    accessToken,
    refreshToken,
  });
});

//route = POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 400, "Please provide email and password");
  }

  if (!validateEmail(email)) {
    return errorResponse(res, 400, "Please provide a valid email address");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user) {
    return errorResponse(res, 401, "Invalid credentials");
  }

  if (user.isBlocked) {
    return errorResponse(res, 403, "Your account has been blocked");
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return errorResponse(res, 401, "Invalid credentials");
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  user.lastLoginAt = new Date();
  user.loginCount = (user.loginCount || 0) + 1;
  await user.save();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: parseInt(process.env.COOKIE_MAX_AGE) || 7 * 24 * 60 * 60 * 1000,
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, cookieOptions);

  const userResponse = user.toJSON();

  return successResponse(res, 200, "User logged in successfully", {
    user: userResponse,
    accessToken,
    refreshToken,
  });
});

//route = POST /api/auth/refresh
export const refreshAccessToken = asyncHandler(async (req, res) => {
  let refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return errorResponse(res, 401, "Refresh token not provided");
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return errorResponse(res, 401, "Invalid or expired refresh token");
    }

    const newAccessToken = generateAccessToken(user._id);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return successResponse(res, 200, "Access token refreshed", {
      accessToken: newAccessToken,
    });
  } catch (error) {
    return errorResponse(res, 401, "Invalid or expired refresh token");
  }
});


//route = POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);

  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return successResponse(res, 200, "User logged out successfully");
});


//route = GET /api/auth/me 
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).populate([
    "createdEvents",
    "attendingEvents",
    "followers",
    "following",
  ]);

  if (!user) {
    return errorResponse(res, 404, "User not found");
  }

  return successResponse(res, 200, "User fetched successfully", {
    user: user.toJSON(),
  });
});

//route = POST /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return errorResponse(res, 400, "Please provide all required fields");
  }

  if (newPassword !== confirmPassword) {
    return errorResponse(res, 400, "New passwords do not match");
  }

  if (!validatePassword(newPassword)) {
    return errorResponse(
      res,
      400,
      "New password must be at least 6 characters and contain uppercase, lowercase, and numbers"
    );
  }

  const user = await User.findById(req.userId).select("+password");

  if (!user) {
    return errorResponse(res, 404, "User not found");
  }
  
  const isPasswordMatch = await user.comparePassword(currentPassword);
  if (!isPasswordMatch) {
    return errorResponse(res, 401, "Current password is incorrect");
  }

  
  user.password = newPassword;
  await user.save();

  return successResponse(res, 200, "Password changed successfully");
});

//route = POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return errorResponse(res, 400, "Please provide your email");
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return successResponse(res, 200, "If an account exists with this email, a reset link will be sent");
  }

 
  const resetToken = generateAccessToken(user._id);
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = dayjs().add(1, "hour");
  await user.save();

  console.log(`Password reset token for ${email}: ${resetToken}`);

  return successResponse(
    res,
    200,
    "Password reset link sent to your email (check console in development)"
  );
});

//route = POST /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    return errorResponse(res, 400, "Please provide new password");
  }

  if (newPassword !== confirmPassword) {
    return errorResponse(res, 400, "Passwords do not match");
  }

  if (!validatePassword(newPassword)) {
    return errorResponse(
      res,
      400,
      "Password must be at least 6 characters and contain uppercase, lowercase, and numbers"
    );
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: new Date() },
  });

  if (!user) {
    return errorResponse(res, 400, "Invalid or expired reset token");
  }

  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;
  await user.save();

  return successResponse(res, 200, "Password reset successfully");
});