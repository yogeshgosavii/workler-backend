// Example of improved error handling in authController.js
import bcrypt from 'bcrypt';
import User from '../models/userModel.js';

export const signup = async (req, res) => {
    const { email, password, username, birthDate, accountType } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, username, birthDate, accountType });
        await user.save();
        console.log(`User created: ${user.email}`);
        res.status(201).send('User created successfully');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Error creating user');
    }
};

export const testAuth = (req, res) => {
    res.send('Auth controller test is working');
};
