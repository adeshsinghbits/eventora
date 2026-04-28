import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  uploadCoverImage,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  deleteUserAccount,
  searchUsers,
} from "../controllers/userController.js";
import { authMiddleware, optionalAuthMiddleware } from "../middlewares/authMiddleware.js";
import upload from "../config/multer.js";

const router = express.Router();

// Public routes
router.get("/search", searchUsers);
router.get("/:id", optionalAuthMiddleware, getUserProfile);
router.get("/:id/followers", getUserFollowers);
router.get("/:id/following", getUserFollowing);

// Protected routes
router.put("/profile/update", authMiddleware, updateUserProfile);
router.post("/profile/avatar", authMiddleware, upload.single("avatar"), uploadAvatar);
router.post("/profile/cover", authMiddleware, upload.single("coverImage"), uploadCoverImage);
router.post("/:id/follow", authMiddleware, followUser);
router.delete("/:id/unfollow", authMiddleware, unfollowUser);
router.delete("/profile/delete", authMiddleware, deleteUserAccount);

export default router;