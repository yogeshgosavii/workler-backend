import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes'

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173',
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    credentials: true,
}));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

console.log("MONGO_URI:", MONGO_URI);

if (!MONGO_URI) {
    console.error('Error: MONGO_URI is not defined in environment variables');
    process.exit(1);
}

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'worklerData',
}).then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
});

app.get("/", (req, res) => {
    console.log("Request to root path received");
    res.send("prod running with MongoDB connection");
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
