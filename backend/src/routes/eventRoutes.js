import express from "express";
import rateLimit from "express-rate-limit";
import {
  getNearbyEvents,
  getClusteredEvents,
  mapSearch,
  getFeaturedNearby,
  getMapFilterOptions,
} from "../controllers/eventMapController.js";
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
  getAllEvents,
  getEventDetails,
  toggleSaveEvent,
} from "../controllers/eventController.js";
import upload from "../config/multer.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ── Rate Limiters ─────────────────────────────────────────────────────────────
const mapLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: { success: false, message: "Too many map requests, please slow down" },
  skip: (req) => req.user?.role === "admin",
  standardHeaders: true,
  legacyHeaders: false,
});

const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: "Too many write requests, please slow down" },
});

// ── MAP ROUTES (public, rate-limited) ─────────────────────────────────────────
// NOTE: analytics defined first to prevent later /:id routes from shadowing it
router.get("/map/analytics", authMiddleware, standardLimiter, (req, res) =>
  res.status(501).json({ success: false, message: "Not implemented yet" })
);
router.get("/map/nearby", mapLimiter, getNearbyEvents);
router.get("/map/clusters", mapLimiter, getClusteredEvents);
router.get("/map/search", mapLimiter, mapSearch);
router.get("/map/featured", mapLimiter, getFeaturedNearby);
router.get("/map/filters", mapLimiter, getMapFilterOptions);

// ── USER LISTS (authenticated) ────────────────────────────────────────────────
// NOTE: these must come before /:id routes to avoid param conflicts
router.get("/user/events/my", authMiddleware, standardLimiter, getMyEvents);
router.get("/user/events/saved", authMiddleware, standardLimiter, getSavedEvents);
router.get("/user/events/attending", authMiddleware, standardLimiter, getAttendingEvents);

// ── EVENT CRUD ────────────────────────────────────────────────────────────────
router.get("/", standardLimiter, getAllEvents);
router.post("/", authMiddleware, writeLimiter, createEvent);

// FIX: added authMiddleware to uploadBanner — was public before
router.post("/upload-banner", authMiddleware, upload.single("banner"), uploadBanner);

// FIX: removed double "events" prefix — was /events/:id → /events/events/:id
router.put("/:id", authMiddleware, writeLimiter, updateEvent);
router.delete("/:id", authMiddleware, writeLimiter, deleteEvent);

// ── EVENT DETAILS (public) ────────────────────────────────────────────────────
router.get("/:id/details", standardLimiter, getEventDetails);

// ── USER EVENT INTERACTIONS ───────────────────────────────────────────────────
router.post("/:id/attend", authMiddleware, writeLimiter, attendEvent);
router.delete("/:id/attend", authMiddleware, writeLimiter, cancelAttendance);
router.post("/:id/save", authMiddleware, writeLimiter, toggleSaveEvent);

export default router;