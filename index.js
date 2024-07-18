import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js'; // Ensure authRoutes is properly exported
import jobRoutes from './routes/jobRoutes.js'; // Uncomment if needed
import profileRoutes from './routes/profileRoutes.js'; // Uncomment if needed
import fileRoutes from './routes/fileRoutes.js'; // Uncomment if needed

dotenv.config();

const app = express();
app.use(express.json());

const corsOptions = {
    credentials: true,
    origin: ['http://localhost:5173', 'https://workler.netlify.app/'] // Whitelist the domains you want to allow
};


app.use(cors(corsOptions));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

console.log("MONGO_URI::", MONGO_URI);

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
    console.error('Failed to connect to MongoDB:', err.message, err.stack);
    process.exit(1);
});

app.get("/", (req, res) => {
    console.log("Request to root path received");
    res.send("prod running with MongoDB connection");
});

// Ensure routes are properly defined before using
app.options('/api/auth/', (req, res) => {
    res.status(200).send(); // Respond with an HTTP OK (200) for preflight requests
  });
  
app.use('/api/auth/', authRoutes);
app.use('/api/jobs', jobRoutes);

app.options('/api/profile/', (req, res) => {
    res.status(200).send(); 
  });

app.use('/api/profile/', profileRoutes);

app.use('/api/files/', fileRoutes );


export default app;
