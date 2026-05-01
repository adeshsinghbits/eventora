import express from "express";
import rateLimit from "express-rate-limit";

// Map controllers (existing)
import {
  getNearbyEvents,
  getClusteredEvents,
  mapSearch,
  getFeaturedNearby,
  toggleSaveEvent,
  getEventDetails,
  getMapFilterOptions,
} from "../controllers/eventMapController.js";

// New CRUD & user-event controllers
import {
  createEvent,
  updateEvent,
  deleteEvent,
  attendEvent,
  cancelAttendance,
  getMyEvents,
  getSavedEvents,
  getAttendingEvents,
  uploadBanner,
} from "../controllers/eventController.js";
import upload from "../config/multer.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Rate limiters
const mapLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  message: "Too many map requests, please slow down",
  skip: (req) => req.user && req.user.role === "admin",
});

const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests, please try again later",
});

// ======================
// MAP ROUTES (public / limited)
// ======================
router.get("/map/nearby", mapLimiter, getNearbyEvents);
router.get("/map/clusters", mapLimiter, getClusteredEvents);
router.get("/map/search", mapLimiter, mapSearch);
router.get("/map/featured", mapLimiter, getFeaturedNearby);
router.get("/map/filters", mapLimiter, getMapFilterOptions);

// ======================
// EVENT CRUD (authenticated)
// ======================
router.post("/", authMiddleware, standardLimiter, createEvent);
router.post("/upload-banner", upload.single("banner"), uploadBanner);
router.put("/events/:id", authMiddleware, standardLimiter, updateEvent);
router.delete("/events/:id", authMiddleware, standardLimiter, deleteEvent);

// ======================
// USER EVENT INTERACTIONS
// ======================
router.post("/events/:id/attend", authMiddleware, standardLimiter, attendEvent);
router.delete("/events/:id/attend", authMiddleware, standardLimiter, cancelAttendance);
router.post("/events/:id/save", authMiddleware, standardLimiter, toggleSaveEvent);

// ======================
// USER LISTS (authenticated)
// ======================
router.get("/user/events/my", authMiddleware, standardLimiter, getMyEvents);
router.get("/user/events/saved", authMiddleware, standardLimiter, getSavedEvents);
router.get("/user/events/attending", authMiddleware, standardLimiter, getAttendingEvents);

// ======================
// PUBLIC EVENT DETAILS
// ======================
router.get("/events/:id/details", standardLimiter, getEventDetails);

// ======================
// PLACEHOLDER ANALYTICS
// ======================
router.get(
  "/map/analytics",
  authMiddleware,
  standardLimiter,
  async (req, res) => {
    res.status(501).json({ message: "Not implemented yet" });
  }
);

export default router;