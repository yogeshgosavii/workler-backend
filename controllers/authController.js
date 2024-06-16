import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { jwtSecret } from '../config';
import User from '../models/userModel';

export async function checkEmail(req, res) {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        res.json({ exists: !!user });
    } catch (error) {
        console.error('Error checking email:', error.message);
        res.status(500).send('Error checking email');
    }
}

export async function getUserDetails(req, res) {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Ensure token exists
        if (!token) {
            return res.status(401).send('Token not provided');
        }

        const decoded = jwt.verify(token, jwtSecret);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            console.log(`User not found for details: ${decoded.userId}`);
            return res.status(404).send('User not found');
        }

        console.log(`User details fetched: ${user.email}`);
        res.json(user);
    } catch (error) {
        console.error('Fetch user details error:', error.message);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).send('Invalid token');
        }
        res.status(500).send('Error fetching user details');
    }
}
