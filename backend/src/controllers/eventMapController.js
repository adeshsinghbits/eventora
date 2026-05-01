import Event from "../models/Event.js";
import validator from "validator";
import asyncHandler from "express-async-handler";

export const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({
    ...req.body,
    organizer: req.user._id,
  });

  res.status(201).json({
    success: true,
    data: event,
  });
});

export const attendEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  if (!event.attendees.includes(req.user._id)) {
    event.attendees.push(req.user._id);
    await event.save();
  }

  res.status(200).json({
    success: true,
    message: "You are attending this event",
  });
});

export const cancelAttendance = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  event.attendees = event.attendees.filter(
    (id) => id.toString() !== req.user._id.toString()
  );

  await event.save();

  res.status(200).json({
    success: true,
    message: "Attendance removed",
  });
});

export const getMyEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user._id });

  res.status(200).json({
    success: true,
    data: events,
  });
});
const validateCoordinates = (lat, lng) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error("Invalid coordinates. Must be numbers.");
  }

  if (latitude < -90 || latitude > 90) {
    throw new Error("Latitude must be between -90 and 90");
  }

  if (longitude < -180 || longitude > 180) {
    throw new Error("Longitude must be between -180 and 180");
  }

  return { latitude, longitude };
};

const getClusterKey = (lat, lng, precision = 2) => {
  return `${lat.toFixed(precision)}_${lng.toFixed(precision)}`;
};

const buildFilterPipeline = (filters) => {
  const pipeline = [
    { $match: { status: "published", isDeleted: false } },
  ];

  // Category filter
  if (filters.category && filters.category !== "all") {
    pipeline.push({ $match: { category: filters.category } });
  }

  // Price range filter
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const priceMatch = { $match: {} };
    if (filters.minPrice !== undefined) {
      priceMatch.$match.price = { $gte: filters.minPrice };
    }
    if (filters.maxPrice !== undefined) {
      priceMatch.$match.price = priceMatch.$match.price
        ? { ...priceMatch.$match.price, $lte: filters.maxPrice }
        : { $lte: filters.maxPrice };
    }
    pipeline.push(priceMatch);
  }

  // Free/Paid filter
  if (filters.isFree !== undefined) {
    pipeline.push({
      $match: { isFree: filters.isFree === "true" || filters.isFree === true },
    });
  }

  // Date range filter
  if (filters.startDate || filters.endDate) {
    const dateMatch = { $match: {} };
    if (filters.startDate) {
      dateMatch.$match.startDate = { $gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      dateMatch.$match.endDate = dateMatch.$match.endDate
        ? { ...dateMatch.$match.endDate, $lte: new Date(filters.endDate) }
        : { $lte: new Date(filters.endDate) };
    }
    pipeline.push(dateMatch);
  }

  return pipeline;
};

export const getNearbyEvents = asyncHandler(async (req, res) => {
  // Validation
  const { lat, lng, radius = 5000 } = req.query;

  // Validate inputs
  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      message: "Latitude and longitude are required",
    });
  }

  const { latitude, longitude } = validateCoordinates(lat, lng);
  const radiusInMeters = Math.min(parseInt(radius) || 5000, 50000); // Cap at 50km

  // Extract filters
  const filters = {
    category: req.query.category,
    minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
    isFree: req.query.isFree,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
  };

  try {
    // Build aggregation pipeline
    const pipeline = buildFilterPipeline(filters);

    // Add geospatial query
    pipeline.push({
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        distanceField: "distance",
        maxDistance: radiusInMeters,
        spherical: true,
      },
    });

    // Project only necessary fields for map
    pipeline.push({
      $project: {
        _id: 1,
        title: 1,
        slug: 1,
        category: 1,
        "bannerImage.url": 1,
        startDate: 1,
        price: 1,
        isFree: 1,
        "location.coordinates": 1,
        distance: 1,
        availableSeats: 1,
        totalSeats: 1,
        organizer: 1,
        isFeatured: 1,
        viewsCount: 1,
      },
    });

    // Limit results
    pipeline.push({ $limit: 100 });

    const events = await Event.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export const getClusteredEvents = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 5000, zoom = 12 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      message: "Latitude and longitude are required",
    });
  }

  const { latitude, longitude } = validateCoordinates(lat, lng);
  const radiusInMeters = Math.min(parseInt(radius) || 5000, 50000);
  const zoomLevel = Math.min(Math.max(parseInt(zoom) || 12, 5), 18);

  // Precision increases with zoom level (higher zoom = less clustering)
  const precision = Math.max(1, 4 - Math.floor(zoomLevel / 4));

  try {
    const pipeline = buildFilterPipeline({});

    pipeline.push({
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        distanceField: "distance",
        maxDistance: radiusInMeters,
        spherical: true,
      },
    });

    // Add cluster grouping
    pipeline.push({
      $addFields: {
        clusterKey: {
          $concat: [
            { $toString: { $round: [{ $arrayElemAt: ["$location.coordinates", 1] }, precision] } },
            "_",
            { $toString: { $round: [{ $arrayElemAt: ["$location.coordinates", 0] }, precision] } },
          ],
        },
      },
    });

    // Group by cluster
    pipeline.push({
      $group: {
        _id: "$clusterKey",
        count: { $sum: 1 },
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
          },
        },
        coordinates: {
          $first: "$location.coordinates",
        },
      },
    });

    // Sort by count
    pipeline.push({ $sort: { count: -1 } });
    pipeline.push({ $limit: 50 });

    const clusters = await Event.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: clusters.length,
      data: clusters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export const mapSearch = asyncHandler(async (req, res) => {
  const { q, lat, lng, radius = 5000 } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: "Search query is required",
    });
  }

  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      message: "Latitude and longitude are required",
    });
  }

  const { latitude, longitude } = validateCoordinates(lat, lng);
  const radiusInMeters = Math.min(parseInt(radius) || 5000, 50000);

  try {
    const results = await Event.find(
      {
        $text: { $search: q },
        status: "published",
        isDeleted: false,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            $maxDistance: radiusInMeters,
          },
        },
      },
      { score: { $meta: "textScore" } }
    )
      .select("_id title slug category bannerImage startDate price isFree location distance")
      .sort({ score: { $meta: "textScore" }, distance: 1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export const getFeaturedNearby = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 10000 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      message: "Latitude and longitude are required",
    });
  }

  const { latitude, longitude } = validateCoordinates(lat, lng);
  const radiusInMeters = Math.min(parseInt(radius) || 10000, 50000);

  try {
    const events = await Event.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          distanceField: "distance",
          maxDistance: radiusInMeters,
          spherical: true,
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
          price: 1,
          isFree: 1,
          "location.coordinates": 1,
          distance: 1,
          isFeatured: 1,
          isVerifiedOrganizer: 1,
        },
      },
      { $limit: 20 },
    ]);

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export const toggleSaveEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id; // Assumes auth middleware

  const event = await Event.findById(id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found",
    });
  }

  event.toggleSaveEvent(userId);
  await event.save();

  const isSaved = event.isUserSavedEvent(userId);

  res.status(200).json({
    success: true,
    message: isSaved ? "Event saved" : "Event removed from saved",
    isSaved,
  });
});

export const getEventDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id)
    .select(
      "_id title slug description bannerImage galleryImages category startDate endDate startTime endTime timezone price isFree venueName fullAddress location viewsCount attendees.length"
    )
    .populate("organizer", "name profileImage");

  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found",
    });
  }

  // Increment view count
  event.incrementViews();
  await event.save();

  res.status(200).json({
    success: true,
    data: event,
  });
});

export const getMapFilterOptions = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 5000 } = req.query;

  const { latitude, longitude } = validateCoordinates(lat, lng);
  const radiusInMeters = Math.min(parseInt(radius) || 5000, 50000);

  try {
    const pipeline = [
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          distanceField: "distance",
          maxDistance: radiusInMeters,
          spherical: true,
        },
      },
      {
        $match: {
          status: "published",
          isDeleted: false,
        },
      },
    ];

    // Get unique categories
    const categories = await Event.aggregate([
      ...pipeline,
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get price range
    const priceRange = await Event.aggregate([
      ...pipeline,
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        categories: categories.map((c) => ({ name: c._id, count: c.count })),
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});