import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
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

dotenv.config();

const app = express();
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: ["http://localhost:5173", "https://workler.netlify.app"],  // Whitelisted frontend origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'],  // Allowed headers
  credentials: true,  // Allow credentials (cookies, etc.)
  preflightContinue: false,  // Handle preflight responses automatically
  optionsSuccessStatus: 204  // Status for successful OPTIONS requests
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests globally
app.options('*', cors(corsOptions));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

console.log("MONGO_URI::", MONGO_URI);

if (!MONGO_URI) {
  console.error("Error: MONGO_URI is not defined in environment variables");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "worklerData",
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message, err.stack);
    process.exit(1);
  });

app.get("/", (req, res) => {
  console.log("Request to root path received");
  res.send("prod running with MongoDB connection");
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

export default app;
