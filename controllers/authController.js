import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import { jwtSecret } from '../config.js';

const { sign, verify } = jwt;

export const testAuth = (req, res) => {
    res.send('Auth controller test is working');
};

// Function to handle user signup
export async function signup(req, res) {
    console.log('Request body:', req.body);
    const { email, password, username, account_type, company_details } = req.body;

    // Log each field to ensure they are received correctly
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Username:', username);
    console.log('Account Type:', account_type);
    console.log('Company Details:', company_details);

    // Validate inputs
    if (!email || !password || !username || !account_type) {
        return res.status(400).send('All fields are required');
    }

    try {
        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(409).send('Email already in use');
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(409).send('Username already in use');
        }

        // Log before hashing the password
        console.log('Hashing password:', password);
        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Password hashed successfully:', hashedPassword);

        const user = new User({ email, password: hashedPassword, username, account_type, company_details });
        await user.save();
        console.log(`User created: ${user.email}`);
        res.status(201).send('User created successfully');
    } catch (error) {
        console.error('Error creating user:', error.message, error.stack);
        res.status(500).send('Error creating user');
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
        const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '7d' });
        res.json({ token });
    } catch (error) {
        console.error('Login error:', error.message, error.stack);
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
        console.error('Error checking email:', error.message, error.stack);
        res.status(500).send('Error checking email');
    }
}

export async function checkUsername(req, res) {
    const { username } = req.body;
    console.log(username);
    try {
        // Check if there is a user with the provided email
        const user = await User.findOne({ username });
        res.json({ exists: !!user });
    } catch (error) {
        console.error('Error checking username:', error.message, error.stack);
        res.status(500).send('Error checking username');
    }
}

export async function updateUserDetails(req, res) {
    console.log(req.body)
    try {
        // Extract token from authorization header
        const token = req.headers.authorization.split(' ')[1];
        
        // Verify and decode the token
        const decoded = jwt.verify(token, jwtSecret);
        
        // Find user by decoded user ID from token, exclude password field
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(404).send('User not found');
        }
        
        // Update user details with the data from the request body
        const { username, email,location, description,personal_details,company_details , githubLink,bio, linkedInLink, portfolioLink, tags, profileImage } = req.body;

        // Set fields to null if they are empty or not provided
        user.username = username !== undefined ? username : null;
        user.email = email !== undefined ? email : null;
        user.description = description !== undefined ? description : null;
        user.githubLink = githubLink !== undefined ? githubLink : null;
        user.linkedInLink = linkedInLink !== undefined ? linkedInLink : null;
        user.portfolioLink = portfolioLink !== undefined ? portfolioLink : null;
        user.tags = tags !== undefined ? tags : [];
        user.profileImage = profileImage !== undefined ? profileImage : null;
        user.bio = bio !== undefined ? bio : null;
        user.location = location !== undefined ? location : null;
        user.personal_details = personal_details !== undefined ? personal_details : null;
        user.company_details = company_details !== undefined ? company_details : null;



        // Save the updated user back to the database
        const updatedUser = await user.save();

        res.json(updatedUser);
    } catch (error) {
        console.error('Update user details error:', error.message, error.stack);

        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).send('Token expired');
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).send('Invalid token');
        }

        res.status(500).send('Error updating user details');
    }
}

export async function getUserDetails(req, res) {
    try {
        // Extract token from authorization header
        const token = req.headers.authorization.split(' ')[1];
        
        // Verify and decode the token
        const decoded = jwt.verify(token, jwtSecret);
        console.log(decoded);
        
        // Find user by decoded user ID from token, exclude password field
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            console.log(`User not found for details: ${decoded.userId}`);
            return res.status(404).send('User not found');
        }
        
        console.log(`User details fetched: ${user.email}`);
        res.json(user);
    } catch (error) {
        console.error('Fetch user details error:', error.message, error.stack);
        
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).send('Token expired');
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).send('Invalid token');
        }
        
        res.status(500).send('Error fetching user details');
    }
}
