import { verify } from 'jsonwebtoken';
import { findById } from '../models/userModel';
// import bcrypt from 'bcrypt';
import { jwtSecret } from '../config'; // Ensure config is properly defined
const User = require('../models/userModel');

// exports.signup = async (req, res) => {
//     const { email, password, username, birthDate, accountType } = req.body;
//     try {
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const user = new User({ email, password: hashedPassword, username, birthDate, accountType });
//         await user.save();
//         console.log(`User created: ${user.email}`);
//         res.status(201).send('User created successfully');
//     } catch (error) {
//         console.error('Error creating user:', error);
//         res.status(400).send('Error creating user');
//     }
// };


// exports.login = async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).send('User not found');
//         }
//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) {
//             return res.status(400).send('Invalid password');
//         }
//         const token = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: '1h' });
//         res.json({ token });
//     } catch (error) {
//         console.error('Login error:', error.message);
//         res.status(500).send('Server error');
//     }
// };

// exports.checkEmail = async (req, res) => {
//     const { email } = req.body;
//     try {
//         const user = await User.findOne({ email });
//         res.json({ exists: !!user });
//     } catch (error) {
//         console.error('Error checking email:', error.message);
//         res.status(500).send('Error checking email');
//     }
// };

export async function getUserDetails(req, res) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        console.log(token);
        const decoded = verify(token, jwtSecret);
        const user = await findById(decoded.userId).select('-password');
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
}
