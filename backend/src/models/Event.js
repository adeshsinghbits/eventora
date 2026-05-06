import mongoose from "mongoose";
import slugify from "slugify";

const eventSchema = new mongoose.Schema(
  {
    // Core Fields
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      index: true,
    },
    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
      maxlength: [500, "Short description cannot exceed 500 characters"],
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      minlength: [50, "Description must be at least 50 characters"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    category: {
      type: String,
      required: [true, "Event category is required"],
      enum: {
        values: ["music", "tech", "sports", "education", "food", "business", "festival", "meetup", "other"],
        message: "Please select a valid category",
      },
      index: true,
    },
    tags: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.length <= 10;
        },
        message: "Cannot have more than 10 tags",
      },
      default: [],
    },

    // Images
    bannerImage: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    galleryImages: [
      {
        url: String,
        public_id: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Organizer
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Event organizer is required"],
      index: true,
    },
    coHosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Date & Time
    startDate: {
      type: Date,
      required: [true, "Event start date is required"],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, "Event end date is required"],
      validate: {
        validator: function (value) {
          return value >= this.startDate;
        },
        message: "End date must be after start date",
      },
    },
    startTime: {
      type: String,
      required: [true, "Event start time is required"],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please provide a valid time format (HH:mm)"],
    },
    endTime: {
      type: String,
      required: [true, "Event end time is required"],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please provide a valid time format (HH:mm)"],
    },
    timezone: {
      type: String,
      required: [true, "Timezone is required"],
      default: "UTC",
    },
    isMultiDay: { type: Boolean, default: false },

    // Location
    venueName: {
      type: String,
      required: [true, "Venue name is required"],
      trim: true,
    },
    addressLine1: {
      type: String,
      required: [true, "Address line 1 is required"],
      trim: true,
    },
    addressLine2: { type: String, trim: true, default: "" },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: [true, "State/Province is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    postalCode: {
      type: String,
      required: [true, "Postal code is required"],
      trim: true,
    },
    landmark: { type: String, trim: true, default: "" },

    // GeoJSON for Map
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: function (v) {
            return (
              Array.isArray(v) &&
              v.length === 2 &&
              v[0] >= -180 &&
              v[0] <= 180 &&
              v[1] >= -90 &&
              v[1] <= 90
            );
          },
          message: "Invalid coordinates. Must be [longitude, latitude]",
        },
      },
    },

    // Ticketing
    isFree: { type: Boolean, default: false },
    price: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be negative"],
    },
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "GBP", "INR", "AUD", "CAD", "SGD", "JPY", "KRW"],
    },
    totalSeats: {
      type: Number,
      required: [true, "Total seats is required"],
      min: [1, "Total seats must be at least 1"],
      validate: {
        validator: (v) => Number.isInteger(v),
        message: "Total seats must be an integer",
      },
    },
    availableSeats: {
      type: Number,
      default: function () {
        return this.totalSeats;
      },
    },
    maxTicketsPerUser: {
      type: Number,
      default: 10,
      min: [1, "Max tickets per user must be at least 1"],
    },
    requiresApproval: { type: Boolean, default: false },
    ticketType: {
      type: String,
      enum: {
        values: ["free", "paid", "invite-only"],
        message: "Please select a valid ticket type",
      },
      required: [true, "Ticket type is required"],
    },

    // Audience & Visibility
    visibility: {
      type: String,
      enum: { values: ["public", "private", "unlisted"] },
      default: "public",
    },
    ageRestriction: {
      type: Number,
      default: 0,
      min: [0, "Age restriction cannot be negative"],
      validate: {
        validator: (v) => Number.isInteger(v) && v <= 120,
        message: "Age restriction must be a valid age",
      },
    },
    allowedGenders: {
      type: [String],
      enum: ["male", "female", "other", "all"],
      default: ["male", "female", "other"],
    },
    spokenLanguages: { type: [String], default: ["English"] },
    dressCode: { type: String, trim: true, default: "" },

    // RSVP & Engagement
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    interestedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    savedByUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likesCount: { type: Number, default: 0, min: 0 },
    sharesCount: { type: Number, default: 0, min: 0 },
    viewsCount: { type: Number, default: 0, min: 0 },

    // Status & Moderation
    status: {
      type: String,
      enum: {
        values: ["draft", "pending", "published", "ongoing", "cancelled", "completed", "rejected"],
        message: "Please select a valid status",
      },
      default: "draft",
      index: true,
    },
    cancelReason: { type: String, trim: true, default: "" },
    rejectionReason: { type: String, trim: true, default: "" },
    isFeatured: { type: Boolean, default: false, index: true },
    isVerifiedOrganizer: { type: Boolean, default: false },
    reportCount: { type: Number, default: 0, min: 0 },

    // Contact & Social
    contactEmail: {
      type: String,
      required: [true, "Contact email is required"],
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    contactPhone: { type: String, trim: true },
    website: { type: String, trim: true, default: "" },
    instagram: { type: String, trim: true, default: "" },
    facebook: { type: String, trim: true, default: "" },
    whatsapp: { type: String, trim: true, default: "" },

    // Rules & Meta
    rules: [{ type: String, trim: true }],
    faq: [
      {
        question: { type: String, required: true, trim: true },
        answer: { type: String, required: true, trim: true },
      },
    ],
    termsAccepted: { type: Boolean, default: false },
    refundPolicy: { type: String, trim: true, default: "", maxlength: 1000 },

    // Analytics
    checkInCount: { type: Number, default: 0, min: 0 },
    clickCount: { type: Number, default: 0, min: 0 },
    conversionRate: { type: Number, default: 0, min: 0, max: 100 },

    // SEO
    metaTitle: { type: String, trim: true, maxlength: 60 },
    metaDescription: { type: String, trim: true, maxlength: 160 },

    // Soft Delete
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
eventSchema.index({ title: "text", description: "text", tags: "text" });
eventSchema.index({ location: "2dsphere" });
eventSchema.index({ city: 1, status: 1 });
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ organizer: 1, status: 1 });
eventSchema.index({ isFeatured: 1, status: 1 });
eventSchema.index({ visibility: 1, status: 1 });
eventSchema.index({ createdAt: -1 });

// ── Virtuals ──────────────────────────────────────────────────────────────────
eventSchema.virtual("seatsFilledPercentage").get(function () {
  if (!this.totalSeats || this.totalSeats === 0) return 0;
  return Math.round(((this.totalSeats - this.availableSeats) / this.totalSeats) * 100);
});

eventSchema.virtual("totalAttendees").get(function () {
  return this.attendees?.length ?? 0;
});

eventSchema.virtual("daysUntilEvent").get(function () {
  const diffTime = Math.abs(this.startDate - new Date());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

eventSchema.virtual("eventDateFormatted").get(function () {
  return this.startDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

eventSchema.virtual("fullAddress").get(function () {
  return [this.addressLine1, this.addressLine2, this.city, this.state, this.postalCode, this.country]
    .filter(Boolean)
    .join(", ");
});

eventSchema.virtual("dynamicStatus").get(function () {
  const now = new Date();

  if (this.status === "cancelled") return "cancelled";

  if (now < this.startDate) return "upcoming";
  if (now >= this.startDate && now <= this.endDate) return "ongoing";
  if (now > this.endDate) return "completed";

  return this.status;
});

// ── Pre-save ──────────────────────────────────────────────────────────────────
eventSchema.pre("save", async function () {
  if (!this.slug || this.isModified("title")) {
    let baseSlug = slugify(this.title, { lower: true, strict: true });

    const existing = await mongoose.model("Event").findOne({
      slug: baseSlug,
      _id: { $ne: this._id },
    });

    this.slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;
  }

  if (this.viewsCount > 0) {
    this.conversionRate = Number(
      ((this.attendees.length / this.viewsCount) * 100).toFixed(2)
    );
  }

  if (this.isFree) {
    this.ticketType = "free";
    this.price = 0;
  } else if (this.price > 0) {
    this.ticketType = "paid";
  }

  this.metaTitle ||= this.title?.substring(0, 60);
  this.metaDescription ||= this.shortDescription?.substring(0, 160);
});

// ── Instance Methods ──────────────────────────────────────────────────────────
eventSchema.methods.isSoldOut = function () {
  return this.availableSeats <= 0;
};

eventSchema.methods.isEventStarted = function () {
  return new Date() > this.startDate;
};

eventSchema.methods.isEventEnded = function () {
  return new Date() > this.endDate;
};

eventSchema.methods.addAttendee = function (userId) {
  if (!this.hasUserRSVPed(userId)) {
    this.attendees.push(userId);
    this.availableSeats = Math.max(0, this.availableSeats - 1);
  }
  return this;
};

eventSchema.methods.removeAttendee = function (userId) {
  const before = this.attendees.length;
  this.attendees = this.attendees.filter(
    (id) => id.toString() !== userId.toString()
  );
  if (this.attendees.length < before) this.availableSeats += 1;
  return this;
};

eventSchema.methods.hasUserRSVPed = function (userId) {
  return this.attendees.some((id) => id.toString() === userId.toString());
};

eventSchema.methods.isUserInterested = function (userId) {
  return this.interestedUsers.some((id) => id.toString() === userId.toString());
};

eventSchema.methods.isUserSavedEvent = function (userId) {
  return this.savedByUsers.some((id) => id.toString() === userId.toString());
};

eventSchema.methods.toggleSaveEvent = function (userId) {
  const idx = this.savedByUsers.findIndex((id) => id.toString() === userId.toString());
  if (idx > -1) {
    this.savedByUsers.splice(idx, 1);
  } else {
    this.savedByUsers.push(userId);
  }
  return this;
};

eventSchema.methods.toggleInterest = function (userId) {
  const idx = this.interestedUsers.findIndex((id) => id.toString() === userId.toString());
  if (idx > -1) {
    this.interestedUsers.splice(idx, 1);
  } else {
    this.interestedUsers.push(userId);
  }
  return this;
};

eventSchema.methods.isOrganizerOrCoHost = function (userId) {
  return (
    this.organizer.toString() === userId.toString() ||
    this.coHosts.some((id) => id.toString() === userId.toString())
  );
};

eventSchema.methods.incrementViews = function () {
  this.viewsCount += 1;
  return this;
};

eventSchema.methods.incrementClicks = function () {
  this.clickCount += 1;
  return this;
};

eventSchema.methods.incrementCheckIns = function () {
  this.checkInCount += 1;
  return this;
};

// ── Static Methods ────────────────────────────────────────────────────────────
eventSchema.statics.findNearby = function (longitude, latitude, maxDistance = 50000) {
  return this.find({
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [longitude, latitude] },
        $maxDistance: maxDistance,
      },
    },
    status: "published",
    isDeleted: false,
  });
};

eventSchema.statics.findUpcoming = function (limit = 10) {
  return this.find({
    startDate: { $gte: new Date() },
    status: "published",
    isDeleted: false,
  })
    .sort({ startDate: 1 })
    .limit(limit);
};

eventSchema.statics.findByCategory = function (category, limit = 10) {
  return this.find({ category, status: "published", isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(limit);
};

eventSchema.statics.findFeatured = function (limit = 5) {
  return this.find({ isFeatured: true, status: "published", isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(limit);
};

eventSchema.statics.findByOrganizer = function (organizerId) {
  return this.find({
    $or: [{ organizer: organizerId }, { coHosts: organizerId }],
    isDeleted: false,
  }).sort({ createdAt: -1 });
};

export default mongoose.model("Event", eventSchema);