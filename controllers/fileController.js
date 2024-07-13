import jwt from 'jsonwebtoken';
import Image from '../models/imageModel.js';
import User from '../models/userModel.js';
import { jwtSecret } from '../config.js';
import upload from '../middleware/uploadMiddleware.js';

export async function uploadImages(req, res) {
  try {
    // Extract token from authorization header
    const token = req.headers.authorization.split(' ')[1];

    // Verify and decode the token
    const decoded = jwt.verify(token, jwtSecret);

    // Find user by decoded user ID from token, exclude password field
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      console.log(`User not found for details: ${decoded.userId}`);
      return res.status(404).send('User not found');
    }

    // Handle file upload
    upload(req, res, async (err) => {
      if (err) {
        console.error('File upload error:', err.message);
        return res.status(400).send('File upload error');
      }

      // Get the uploaded file details
      const originalImage = req.files.originalImage ? req.files.originalImage[0] : null;
      const compressedImage = req.files.compressedImage ? req.files.compressedImage[0] : null;

      if (!originalImage || !compressedImage) {
        return res.status(400).send('Both images are required');
      }

      // Save image metadata to the database
      const image = new Image({
        userId: user._id,
        originalImagePath: `/uploads/images/original/${originalImage.filename}`,
        compressedImagePath: `/uploads/images/compressed/${compressedImage.filename}`
      });

      await image.save();

      // Send response with image details
      res.json({
        message: 'Images uploaded successfully',
        imageData: {
          originalImageUrl: image.originalImagePath,
          compressedImageUrl: image.compressedImagePath
        },
        user
      });
    });
  } catch (error) {
    console.error('Error during file upload:', error.message, error.stack);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).send('Token expired');
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).send('Invalid token');
    }

    res.status(500).send('Error during file upload');
  }
}
