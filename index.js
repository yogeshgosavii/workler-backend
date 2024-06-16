import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes'; // Ensure authRoutes is properly exported
// import jobRoutes from './routes/jobRoutes';
// import profileRoutes from './routes/profileRoutes';

dotenv.config();

const app = express();
app.use(express.json());

const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    credentials: true,
};

app.use(cors(corsOptions));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

console.log("MONGO_URI:", MONGO_URI); // Log MONGO_URI to check if it's being read correctly

if (!MONGO_URI) {
    console.error('Error: MONGO_URI is not defined in environment variables');
    process.exit(1);
}

// Test MongoDB connection separately
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'worklerData',
}).then(() => {
    console.log('Connected to MongoDB');
    // Start the server only after a successful MongoDB connection
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
});

app.get("/", (req, res) => {
    console.log("Request to root path received");
    res.send("prod running with MongoDB connection");
});

// Enable authRoutes
app.use('/api/auth', authRoutes);

// app.use('/api/jobs', jobRoutes);
// app.use('/api/profile', profileRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
