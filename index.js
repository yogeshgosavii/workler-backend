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
import approachRoutes from "./routes/approachRoutes.js"
import applicationRoutes from "./routes/applicationRoutes.js"
import interviewRoute from "./routes/interviewRoute.js"
import resumeRoutes from "./routes/resumeRoute.js"
import followRoutes from "./routes/followRoute.js"
import savedRoutes from "./routes/savedRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js"
import axios from "axios"; // Add this line at the top




dotenv.config();

const app = express();
app.use(express.json());

const corsOptions = {
  credentials: true,
  origin: ["http://localhost:5173", "https://workler.netlify.app/"], // Whitelist the domains to allow
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow headers you need

};

app.use(cors(corsOptions));

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

// Ensure routes are properly defined before using
app.options("/api/auth/", (req, res) => {
  res.status(200).send(); // Respond with an HTTP OK (200) for preflight requests
});

app.use("/api/auth/", authRoutes);
app.use("/api/jobs", jobRoutes);

app.options("/api/profile/", (req, res) => {
  res.status(200).send();
});

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

app.get('/proxy', async (req, res) => {
  const url = req.query.url;

  if (!url) {
      return res.status(400).send('URL is required');
  }

  try {
      const response = await axios.get(url, {
          responseType: 'arraybuffer', // Use 'arraybuffer' to handle binary data
          headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
      });

      const contentType = response.headers['content-type'];
      res.set('Content-Type', contentType); // Set the correct content type
      res.send(response.data); // Send the image data
  } catch (error) {
      console.error('Error fetching image:', error.message);
      if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
      }
      res.status(500).send('Error fetching image');
  }
});



const imageUrl = 'https://remotive.com/job/1937582/logo';
const proxyUrl = 'http://localhost:5002/proxy?url=';

fetch(proxyUrl + encodeURIComponent(imageUrl))
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.blob(); // Convert response to a Blob
    })
    .then(imageBlob => {
        const imageObjectURL = URL.createObjectURL(imageBlob); // Create a local URL for the blob
        const imgElement = document.createElement('img');
        imgElement.src = imageObjectURL; // Set the src of the image
        document.body.appendChild(imgElement); // Append the image to the document body
    })
    .catch(error => console.error('Error fetching image:', error));


















export default app;
