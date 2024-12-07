import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config.js';
import User from '../models/userModel.js';

export async function protect(req, res, next) {
  try {
    let token;


    console.log("body",req.body);
      // console.time("Total Request Time"); // Start total timer

    
    // Extract token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
      console.log('Decoded token:', decoded);
    } catch (error) {
      console.error('JWT verification error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }

    // Check if token is decoded
    if (!decoded) {
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }

    // Find user by ID
    const user = await User.findById(decoded.userId).select('-password');
    // console.log(user);
    
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Error in authentication middleware:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
}
