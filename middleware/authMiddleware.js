import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config.js';
import User from '../models/userModel.js';

export async function protect(req, res, next) {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, jwtSecret); // Use jwt.verify directly
    // console.log(decoded);

    if (!decoded) {
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error in authentication middleware:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
}
