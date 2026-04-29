import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dayjs from "dayjs";
import connectDB from "./config/database.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
const app = express();

app.use(helmet());

app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || "http://localhost:5173").split(","),
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use((req, res, next) => {
  const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"),
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Event Management Backend API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      health: "/api/health",
    },
  });
});

// error handling middleware 
app.use(notFoundHandler);
app.use(errorHandler);


const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");
    console.error(`\n✗ Server Error at ${timestamp}: ${error.message}\n`);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");
  console.error(`\n✗ Unhandled Rejection at ${timestamp}: ${error.message}\n`);
  process.exit(1);
});

startServer();

export default app;