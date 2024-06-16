import pkg from 'jsonwebtoken';
const { verify, sign } = pkg; // Destructure the required methods from the imported package

import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import { jwtSecret } from '../config.js';

export async function signup(req, res) {
    const { email, password, username, birthDate, accountType } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, username, birthDate, accountType });
        await user.save();
        console.log(`User created: ${user.email}`);
        res.status(201).send('User created successfully');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(400).send('Error creating user');
    }
};

export async function login(req, res) {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send('User not found');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send('Invalid password');
        }
        const token = sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).send('Server error');
    }
};

export async function checkEmail(req, res) {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        res.json({ exists: !!user });
    } catch (error) {
        console.error('Error checking email:', error.message);
        res.status(500).send('Error checking email');
    }
};

export async function getUserDetails(req, res) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = verify(token, jwtSecret);
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            console.log(`User not found for details: ${decoded.userId}`);
            return res.status(404).send('User not found');
        }
        console.log(`User details fetched: ${user.email}`);
        res.json(user);
    } catch (error) {
        console.error('Fetch user details error:', error.message);
        res.status(500).send('Error fetching user details');
    }
};
