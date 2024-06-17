import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/userModel.js';
import { jwtSecret } from '../config.js';

const { sign, verify } = jwt;

// Function to handle user signup
export async function signup(req, res) {
    const { email, password, username, birthDate, accountType } = req.body;
    try {
        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, username, birthDate, accountType });
        await user.save();
        console.log(`User created: ${user.email}`);
        res.status(201).send('User created successfully');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(400).send('Error creating user');
    }
}

// Function to handle user login
export async function login(req, res) {
    const { email, password } = req.body;
    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send('User not found');
        }
        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send('Invalid password');
        }
        
        // Generate JWT token with user ID as payload
        const token = sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).send('Server error');
    }
}

// Function to check if an email exists in the database
export async function checkEmail(req, res) {
    const { email } = req.body;
    try {
        // Check if there is a user with the provided email
        const user = await User.findOne({ email });
        res.json({ exists: !!user });
    } catch (error) {
        console.error('Error checking email:', error.message);
        res.status(500).send('Error checking email');
    }
}

// Function to fetch user details using JWT token
// export async function getUserDetails(req, res) {
//     try {
//         // Extract token from authorization header
//         const token = req.headers.authorization.split(' ')[1];
        
//         // Verify and decode the token
//         const decoded = jwt.verify(token, jwtSecret);
        
//         // Find user by decoded user ID from token, exclude password field
//         const user = await User.findById(decoded.userId).select('-password');
        
//         if (!user) {
//             console.log(`User not found for details: ${decoded.userId}`);
//             return res.status(404).send('User not found');
//         }
        
//         console.log(`User details fetched: ${user.email}`);
//         res.json(user);
//     } catch (error) {
//         console.error('Fetch user details error:', error.message);
        
//         if (error instanceof jwt.TokenExpiredError) {
//             return res.status(401).send('Token expired');
//         }
        
//         if (error.name === 'JsonWebTokenError') {
//             return res.status(401).send('Invalid token');
//         }
        
//         res.status(500).send('Error fetching user details');
//     }
// }
