import Event from "../models/Event.js";
import asyncHandler from "express-async-handler";
import validator from "validator";

// ------------------- CREATE -------------------
export const createEvent = asyncHandler(async (req, res) => {
  console.log("hsh");
  
  try {
    console.log("BODY:", req.body);

    if (req.body.location && typeof req.body.location === "string") {
      req.body.location = JSON.parse(req.body.location);
    }

    if (req.body.bannerImage && typeof req.body.bannerImage === "string") {
      req.body.bannerImage = JSON.parse(req.body.bannerImage);
    }

    const event = await Event.create({
      ...req.body,
      organizer: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (err) {
    console.error("CREATE EVENT ERROR:", err); // 🔥 IMPORTANT
    res.status(500).json({ message: err.message });
  }
});

export const uploadBanner = async (req, res) => {
  console.log("FILE RECEIVED:", req.file); // 🔥 DEBUG LINE

  if (!req.file) {
    return res.status(400).json({
      message: "No file received. Check field name 'banner'.",
    });
  }

  return res.json({
    message: "File received",
  });
};

// ------------------- UPDATE -------------------
export const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  // Authorization: only organizer or co-host can update
  if (!event.isOrganizerOrCoHost(userId)) {
    return res.status(403).json({ success: false, message: "Not authorized to update this event" });
  }

  // Prevent updating certain fields if event is already published/completed
  const forbiddenUpdates = ["status", "isDeleted", "createdAt", "attendees", "savedByUsers"];
  forbiddenUpdates.forEach(field => delete req.body[field]);

  // Update allowed fields
  Object.assign(event, req.body);
  await event.save();

  res.status(200).json({
    success: true,
    data: event,
  });
});

// ------------------- DELETE (soft delete) -------------------
export const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  // Only organizer can soft-delete
  if (event.organizer.toString() !== userId.toString()) {
    return res.status(403).json({ success: false, message: "Only the organizer can delete this event" });
  }

  event.isDeleted = true;
  event.status = "cancelled";
  await event.save();

  res.status(200).json({
    success: true,
    message: "Event has been deleted",
  });
});

// ------------------- ATTEND (RSVP) -------------------
export const attendEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  if (event.status !== "published") {
    return res.status(400).json({ success: false, message: "Event is not available for attendance" });
  }

  if (event.isSoldOut()) {
    return res.status(400).json({ success: false, message: "Event is sold out" });
  }

  // Use schema method to add attendee and decrease seats
  if (!event.hasUserRSVPed(userId)) {
    event.addAttendee(userId);
    await event.save();
  }

  res.status(200).json({
    success: true,
    message: "You are now attending this event",
  });
});

// ------------------- CANCEL ATTENDANCE -------------------
export const cancelAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  if (event.hasUserRSVPed(userId)) {
    event.removeAttendee(userId);
    await event.save();
  }

  res.status(200).json({
    success: true,
    message: "Attendance removed successfully",
  });
});

// ------------------- MY ORGANIZED EVENTS -------------------
export const getMyEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user._id, isDeleted: false })
    .sort({ createdAt: -1 })
    .populate("organizer", "name email");

  res.status(200).json({
    success: true,
    count: events.length,
    data: events,
  });
});

// ------------------- SAVED EVENTS -------------------
export const getSavedEvents = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find events where the user is in savedByUsers array
  const savedEvents = await Event.find({
    savedByUsers: userId,
    isDeleted: false,
    status: "published",
  })
    .sort({ createdAt: -1 })
    .populate("organizer", "name");

  res.status(200).json({
    success: true,
    count: savedEvents.length,
    data: savedEvents,
  });
});

// ------------------- EVENTS USER IS ATTENDING (RSVPed) -------------------
export const getAttendingEvents = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const attendingEvents = await Event.find({
    attendees: userId,
    isDeleted: false,
  })
    .sort({ startDate: 1 }) // upcoming first
    .populate("organizer", "name");

  res.status(200).json({
    success: true,
    count: attendingEvents.length,
    data: attendingEvents,
  });
});