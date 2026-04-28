import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // Basic Auth
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    username: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    
    // Profile
    avatar: {
      url: String,
      public_id: String,
    },
    coverImage: {
      url: String,
      public_id: String,
    },
    bio: {
      type: String,
      maxlength: 300,
      default: "",
    },
    phone: String,
    website: String,
    city: String,
    state: String,
    country: String,
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    interests: [String], // music, sports, tech, startup etc
    // Role / Access
    role: {
      type: String,
      enum: ["user", "organizer", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    // Event Relations
    createdEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    attendingEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    interestedEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    savedEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    // Social
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Notifications
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    pushToken: String,
    unreadNotifications: {
      type: Number,
      default: 0,
    },
    // Security
    refreshToken: String,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifyToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLoginAt: Date,
    loginCount: {
      type: Number,
      default: 0,
    },
    // Analytics / Reputation
    points: {
      type: Number,
      default: 0,
    },
    badges: [String],
    reportsCount: {
      type: Number,
      default: 0,
    },
    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for geospatial queries
userSchema.index({ location: "2dsphere" });

// Pre-save middleware to hash password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  const bcrypt = await import("bcryptjs");
  return await bcrypt.default.compare(enteredPassword, this.password);
};

// Method to hide sensitive fields
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  delete user.emailVerifyToken;
  delete user.resetPasswordToken;
  return user;
};

export default mongoose.model("User", userSchema);