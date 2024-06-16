// const express = require('express');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const authRoutes = require('./routes/authRoutes');
// const jobRoutes = require('./routes/jobRoutes');
// const profileRoutes = require('./routes/profileRoutes');

// dotenv.config();

// const app = express();
// app.use(express.json());

// const corsOptions = {
//     origin: process.env.CORS_ORIGIN || '*', // Use environment variable or allow all
//     methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
//     credentials: true,
// };

// app.use(cors(corsOptions));

// const PORT = process.env.PORT || 5000;
// const MONGO_URI = process.env.MONGO_URI;

// // if (!MONGO_URI) {
// //     console.error('Error: MONGO_URI is not defined in environment variables');
// //     process.exit(1);
// // }

// // mongoose.connect(MONGO_URI, {
// //     useNewUrlParser: true,
// //     useUnifiedTopology: true,
// //     dbName: 'worklerData',
// // }).then(() => {
// //     console.log('Connected to MongoDB');
// // }).catch((err) => {
// //     console.error('Failed to connect to MongoDB', err);
// // });

// app.get("/", (req, res) => {
//     console.log("Request to root path received");
//     res.send("prod running");
// });

// // app.use('/api/auth', authRoutes);
// // app.use('/api/jobs', jobRoutes);
// // app.use('/api/profile', profileRoutes);

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

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
}).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
});

app.get("/", (req, res) => {
    res.send("MongoDB connected");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


