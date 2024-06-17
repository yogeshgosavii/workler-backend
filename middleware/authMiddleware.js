import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config.js';
import User from '../models/userModel.js';

export async function protect(req, res, next) {
  try {
    // Check if Authorization header is present and extract token
    const authHeader = req.headers.authorization;
    console.log(authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify and decode the token
      const decoded = jwt.verify(token, jwtSecret);
      // console.log("decoded",decoded);

      // Fetch user details from the database
      const user = await User.findById(decoded.userId).select('-password');
      console.log(user);

      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Attach user details to the request object for further processing
      req.user = user;
      next(); // Move to the next middleware or route handler
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: 'Token expired' });
      } else if (error instanceof jwt.JsonWebTokenError) {
        console.error('Error in token verification:', error.message);
        return res.status(401).json({ message: 'Not authorized, token invalid' });
      } else {
        console.error('Error in token verification:', error.message);
        return res.status(500).json({ message: 'Server Error' });
      }
    }
  } catch (error) {
    console.error('Error in authentication middleware:', error.message);
    return res.status(500).json({ message: 'Server Error' });
  }
}
