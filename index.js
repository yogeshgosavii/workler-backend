import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import nodemailer from "nodemailer";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import approachRoutes from "./routes/approachRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import interviewRoute from "./routes/interviewRoute.js";
import resumeRoutes from "./routes/resumeRoute.js";
import followRoutes from "./routes/followRoute.js";
import savedRoutes from "./routes/savedRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import preferenceRoutes from "./routes/preferenceRoutes.js";
import scrapeRoutes from "./routes/scrapeRoutes.js";


dotenv.config();

const app = express();
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: ["http://localhost:5173", "https://workler.netlify.app", "https://workler.in"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// MongoDB connection setup
let isConnected = false;  // MongoDB connection state

const connectDB = async () => {
  if (isConnected) return;
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "worklerData",
    });
    console.log("Connected to MongoDB");
    isConnected = true;
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
};


// Initialize MongoDB connection once
connectDB();

// Root route
app.get("/", (req, res) => {
  res.send("Prod running with MongoDB connection");
});

// Use routes
app.use("/api/auth/", authRoutes);
app.use("/api/jobs/", jobRoutes);
app.use("/api/profile/", profileRoutes);
app.use("/api/images/", imageRoutes);
app.use("/api/application/", applicationRoutes);
app.use("/api/search/", searchRoutes);
app.use("/api/posts/", postRoutes);
app.use("/api/location/", locationRoutes);
app.use("/api/interview/", interviewRoute);
app.use("/api/approach/", approachRoutes);
app.use("/api/resume/", resumeRoutes);
app.use("/api/follow/", followRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/preference", preferenceRoutes);
app.use("/api/scrape", scrapeRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
