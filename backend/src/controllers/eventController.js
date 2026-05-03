import Event from "../models/Event.js";
import asyncHandler from "express-async-handler";
import { uploadToCloudinary } from "../utils/cloudinaryUtils.js";

// ── Helpers ───────────────────────────────────────────────────────────────────
const parseBodyJSON = (req, fields) => {
  fields.forEach((field) => {
    if (req.body[field] && typeof req.body[field] === "string") {
      try {
        req.body[field] = JSON.parse(req.body[field]);
      } catch {
        // leave as-is; Mongoose validation will catch bad data
      }
    }
  });
};

// ── CREATE ────────────────────────────────────────────────────────────────────
export const createEvent = asyncHandler(async (req, res) => {
  parseBodyJSON(req, ["location", "bannerImage", "faq", "rules", "tags"]);

  const event = await Event.create({
    ...req.body,
    organizer: req.user._id,
    status: "published", 
  });

  res.status(201).json({ success: true, data: event });
});

// ── UPLOAD BANNER ─────────────────────────────────────────────────────────────
export const uploadBanner = asyncHandler(async (req, res) => {
  console.log("HEADERS:", req.headers["content-type"]);
  console.log("FILE:", req.file);
  console.log("BODY:", req.body);
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file received" });
  }

  const result = await uploadToCloudinary(req.file.buffer);

  res.json({ success: true, public_id: result.public_id, url: result.url });
});

// ── UPDATE ────────────────────────────────────────────────────────────────────
export const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  if (!event.isOrganizerOrCoHost(req.user._id)) {
    return res.status(403).json({ success: false, message: "Not authorized to update this event" });
  }

  const forbidden = ["isDeleted", "createdAt", "attendees", "savedByUsers", "organizer"];
  forbidden.forEach((f) => delete req.body[f]);

  Object.assign(event, req.body);
  await event.save();

  res.status(200).json({ success: true, data: event });
});

// ── DELETE (soft) ─────────────────────────────────────────────────────────────
export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  if (event.organizer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Only the organizer can delete this event" });
  }

  event.isDeleted = true;
  event.status = "cancelled";
  await event.save();

  res.status(200).json({ success: true, message: "Event deleted successfully" });
});

// ── ATTEND (RSVP) ─────────────────────────────────────────────────────────────
export const attendEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  if (event.status !== "published") {
    return res.status(400).json({ success: false, message: "Event is not available for attendance" });
  }

  if (event.isSoldOut()) {
    return res.status(400).json({ success: false, message: "Event is sold out" });
  }

  if (!event.hasUserRSVPed(req.user._id)) {
    event.addAttendee(req.user._id);
    await event.save();
  }

  res.status(200).json({ success: true, message: "You are now attending this event" });
});

// ── CANCEL ATTENDANCE ─────────────────────────────────────────────────────────
export const cancelAttendance = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  if (event.hasUserRSVPed(req.user._id)) {
    event.removeAttendee(req.user._id);
    await event.save();
  }

  res.status(200).json({ success: true, message: "Attendance cancelled successfully" });
});

// ── TOGGLE SAVE ───────────────────────────────────────────────────────────────
export const toggleSaveEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  event.toggleSaveEvent(req.user._id);
  await event.save();

  const isSaved = event.isUserSavedEvent(req.user._id);

  res.status(200).json({
    success: true,
    isSaved,
    message: isSaved ? "Event saved" : "Event removed from saved",
  });
});

// ── GET ALL EVENTS (explore / paginated) ──────────────────────────────────────
export const getAllEvents = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    search,
    minPrice,
    maxPrice,
    isFree,
    startDate,
    endDate,
    sortBy = "startDate",
    sortOrder = "asc",
  } = req.query;

  console.log(req.query);
  

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const filter = {  isDeleted: false };

  if (category && category !== "all") filter.category = category;

  if (search?.trim()) {
    filter.$or = [
      { title: { $regex: search.trim(), $options: "i" } },
      { description: { $regex: search.trim(), $options: "i" } },
    ];
  }

  if (isFree !== undefined && isFree !== "") {
    filter.isFree = isFree === "true";
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
  }

  if (startDate || endDate) {
    filter.startDate = {};
    if (startDate) filter.startDate.$gte = new Date(startDate);
    if (endDate) filter.startDate.$lte = new Date(endDate);
  }

  const sortMap = {
    price: { price: sortOrder === "desc" ? -1 : 1 },
    popularity: { viewsCount: -1 },
    newest: { createdAt: -1 },
    startDate: { startDate: sortOrder === "desc" ? -1 : 1 },
  };
  const sort = sortMap[sortBy] ?? sortMap.startDate;
  
  const [events, total] = await Promise.all([
    Event.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select("-attendees -savedByUsers -interestedUsers -faq -rules")
      .populate("organizer", "name profileImage"),
    Event.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: events,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

// ── GET EVENT DETAILS ─────────────────────────────────────────────────────────
// FIX: removed invalid attendees.length from .select() — use virtual instead
export const getEventDetails = asyncHandler(async (req, res) => {
  const event = await Event.findOne({
    _id: req.params.id,
    isDeleted: false,
  })
    .select("-savedByUsers -interestedUsers")
    .populate("organizer", "name profileImage")
    .populate("coHosts", "name profileImage");

  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  event.incrementViews();
  await event.save();

  res.status(200).json({ success: true, data: event });
});

// ── MY ORGANIZED EVENTS ───────────────────────────────────────────────────────
export const getMyEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user._id, isDeleted: false })
    .sort({ createdAt: -1 })
    .select("-savedByUsers -interestedUsers")
    .populate("organizer", "name email");

  res.status(200).json({ success: true, count: events.length, data: events });
});

// ── SAVED EVENTS ──────────────────────────────────────────────────────────────
export const getSavedEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({
    savedByUsers: req.user._id,
    isDeleted: false,
    status: "published",
  })
    .sort({ createdAt: -1 })
    .select("-savedByUsers -interestedUsers -attendees")
    .populate("organizer", "name");

  res.status(200).json({ success: true, count: events.length, data: events });
});

// ── ATTENDING EVENTS ──────────────────────────────────────────────────────────
export const getAttendingEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({
    attendees: req.user._id,
    isDeleted: false,
  })
    .sort({ startDate: 1 })
    .select("-savedByUsers -interestedUsers")
    .populate("organizer", "name");

  res.status(200).json({ success: true, count: events.length, data: events });
});