const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // Import the cors package
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const profileRoutes = require('./routes/profileRoutes'); // Import the profile routes

dotenv.config();

const app = express();
app.use(express.json());

const corsOptions = {
    // Replace with your domain
    origin: 'https://workler-backend.vercel.app/',
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    // Enable this if you need to
    // send cookies or HTTP authentication
    credentials: true,
  };

app.use(cors(corsOptions)); // Use the cors middleware


const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'worklerData',
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
});


app.get("/", (req, res) => {
    console.log("Request to root path received");
    res.send("prod running");
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/profile', profileRoutes); // Use the profile routes

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
