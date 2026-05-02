import Event from "../models/Event.js";
import asyncHandler from "express-async-handler";

// ── Shared helper: validate & parse lat/lng ───────────────────────────────────
const validateCoordinates = (lat, lng) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    const err = new Error("Invalid coordinates");
    err.statusCode = 400;
    throw err;
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    const err = new Error("Coordinates out of valid range");
    err.statusCode = 400;
    throw err;
  }

  return { latitude, longitude };
};

// ── Shared helper: build match stage from query filters ───────────────────────
const buildMatchStage = (query) => {
  const match = { status: "published", isDeleted: false };

  if (query.category && query.category !== "all") match.category = query.category;
  if (query.isFree !== undefined && query.isFree !== "")
    match.isFree = query.isFree === "true";

  const minPrice = query.minPrice ? parseFloat(query.minPrice) : undefined;
  const maxPrice = query.maxPrice ? parseFloat(query.maxPrice) : undefined;
  if (minPrice !== undefined || maxPrice !== undefined) {
    match.price = {};
    if (minPrice !== undefined) match.price.$gte = minPrice;
    if (maxPrice !== undefined) match.price.$lte = maxPrice;
  }

  if (query.startDate || query.endDate) {
    match.startDate = {};
    if (query.startDate) match.startDate.$gte = new Date(query.startDate);
    if (query.endDate) match.startDate.$lte = new Date(query.endDate);
  }

  return match;
};

// ── GET NEARBY EVENTS ─────────────────────────────────────────────────────────
export const getNearbyEvents = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 5000 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ success: false, message: "lat and lng are required" });
  }

  const { latitude, longitude } = validateCoordinates(lat, lng);
  const radiusInMeters = Math.min(parseInt(radius) || 5000, 50000);

  // $geoNear MUST be the first stage in any aggregation pipeline
  const pipeline = [
    {
      $geoNear: {
        near: { type: "Point", coordinates: [longitude, latitude] },
        distanceField: "distance",
        maxDistance: radiusInMeters,
        spherical: true,
        key: "location",
      },
    },
    { $match: buildMatchStage(req.query) },
    {
      $project: {
        _id: 1,
        title: 1,
        slug: 1,
        category: 1,
        bannerImage: 1,
        startDate: 1,
        startTime: 1,
        price: 1,
        isFree: 1,
        currency: 1,
        location: 1,
        distance: 1,
        venueName: 1,
        city: 1,
        availableSeats: 1,
        totalSeats: 1,
        organizer: 1,
        isFeatured: 1,
        status: 1,
      },
    },
    { $limit: 100 },
  ];

  const events = await Event.aggregate(pipeline);

  res.status(200).json({ success: true, count: events.length, data: events });
});


export const getClusteredEvents = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 5000, zoom = 12 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ success: false, message: "lat and lng are required" });
  }

  const { latitude, longitude } = validateCoordinates(lat, lng);
  const radiusInMeters = Math.min(parseInt(radius) || 5000, 50000);
  const zoomLevel = Math.min(Math.max(parseInt(zoom) || 12, 5), 18);

  // Higher zoom = less clustering = more decimal precision
  const precision = Math.max(1, 4 - Math.floor(zoomLevel / 4));

  const pipeline = [
    // MUST be first
    {
      $geoNear: {
        near: { type: "Point", coordinates: [longitude, latitude] },
        distanceField: "distance",
        maxDistance: radiusInMeters,
        spherical: true,
        key: "location",
      },
    },
    { $match: buildMatchStage(req.query) },
    {
      $addFields: {
        clusterKey: {
          $concat: [
            { $toString: { $round: [{ $arrayElemAt: ["$location.coordinates", 1] }, precision] } },
            "_",
            { $toString: { $round: [{ $arrayElemAt: ["$location.coordinates", 0] }, precision] } },
          ],
        },
      },
    },
    {
      $group: {
        _id: "$clusterKey",
        count: { $sum: 1 },
        coordinates: { $first: "$location.coordinates" },
        events: {
          $push: {
            _id: "$_id",
            title: "$title",
            slug: "$slug",
            category: "$category",
            bannerImageUrl: "$bannerImage.url",
            startDate: "$startDate",
            price: "$price",
            isFree: "$isFree",
            coordinates: "$location.coordinates",
            distance: "$distance",
            venueName: "$venueName",
          },
        },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 50 },
  ];

  const clusters = await Event.aggregate(pipeline);

  res.status(200).json({ success: true, count: clusters.length, data: clusters });
});

// ── MAP SEARCH ────────────────────────────────────────────────────────────────
// FIX: $text + $near is invalid in MongoDB — replaced with $geoNear pipeline + regex fallback
export const mapSearch = asyncHandler(async (req, res) => {
  const { q, lat, lng, radius = 5000 } = req.query;

  if (!q?.trim()) {
    return res.status(400).json({ success: false, message: "Search query is required" });
  }
  if (!lat || !lng) {
    return res.status(400).json({ success: false, message: "lat and lng are required" });
  }

  const { latitude, longitude } = validateCoordinates(lat, lng);
  const radiusInMeters = Math.min(parseInt(radius) || 5000, 50000);
  const safeQuery = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const pipeline = [
    {
      $geoNear: {
        near: { type: "Point", coordinates: [longitude, latitude] },
        distanceField: "distance",
        maxDistance: radiusInMeters,
        spherical: true,
        key: "location",
      },
    },
    {
      $match: {
        status: "published",
        isDeleted: false,
        $or: [
          { title: { $regex: safeQuery, $options: "i" } },
          { description: { $regex: safeQuery, $options: "i" } },
          { tags: { $regex: safeQuery, $options: "i" } },
          { venueName: { $regex: safeQuery, $options: "i" } },
          { city: { $regex: safeQuery, $options: "i" } },
        ],
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        slug: 1,
        category: 1,
        bannerImage: 1,
        startDate: 1,
        price: 1,
        isFree: 1,
        location: 1,
        distance: 1,
        venueName: 1,
        city: 1,
      },
    },
    { $sort: { distance: 1 } },
    { $limit: 50 },
  ];

  const results = await Event.aggregate(pipeline);

  res.status(200).json({ success: true, count: results.length, data: results });
});

// ── GET FEATURED NEARBY ───────────────────────────────────────────────────────
export const getFeaturedNearby = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 10000 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ success: false, message: "lat and lng are required" });
  }

  const { latitude, longitude } = validateCoordinates(lat, lng);
  const radiusInMeters = Math.min(parseInt(radius) || 10000, 50000);

  const events = await Event.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: [longitude, latitude] },
        distanceField: "distance",
        maxDistance: radiusInMeters,
        spherical: true,
        key: "location",
      },
    },
    {
      $match: {
        status: "published",
        isDeleted: false,
        isFeatured: true,
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        slug: 1,
        category: 1,
        "bannerImage.url": 1,
        startDate: 1,
        startTime: 1,
        price: 1,
        isFree: 1,
        currency: 1,
        "location.coordinates": 1,
        distance: 1,
        isFeatured: 1,
        isVerifiedOrganizer: 1,
        venueName: 1,
        city: 1,
      },
    },
    { $limit: 20 },
  ]);

  res.status(200).json({ success: true, count: events.length, data: events });
});

// ── GET MAP FILTER OPTIONS ────────────────────────────────────────────────────
// FIX: added lat/lng guard before validateCoordinates
export const getMapFilterOptions = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 5000 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ success: false, message: "lat and lng are required" });
  }

  const { latitude, longitude } = validateCoordinates(lat, lng);
  const radiusInMeters = Math.min(parseInt(radius) || 5000, 50000);

  const geoStages = [
    {
      $geoNear: {
        near: { type: "Point", coordinates: [longitude, latitude] },
        distanceField: "distance",
        maxDistance: radiusInMeters,
        spherical: true,
        key: "location",
      },
    },
    { $match: { status: "published", isDeleted: false } },
  ];

  const [categories, priceRange] = await Promise.all([
    Event.aggregate([
      ...geoStages,
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Event.aggregate([
      ...geoStages,
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      categories: categories.map((c) => ({ name: c._id, count: c.count })),
      priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 },
    },
  });
});