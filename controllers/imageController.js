import jwt from 'jsonwebtoken';
import Image from '../models/imageModel.js';
import User from '../models/userModel.js';
import { jwtSecret } from '../config.js';
import { storage } from '../firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const uploadFileToFirebase = async (fileBuffer, fileName, folder) => {
  const fileRef = ref(storage, `${folder}/${Date.now()}_${fileName}`);
  const snapshot = await uploadBytes(fileRef, fileBuffer);
  const publicUrl = await getDownloadURL(snapshot.ref);
  return publicUrl;
};
const compressImage = async (imageBuffer) => {
  try {
    const compressedImageBuffer = await sharp(imageBuffer)
      .resize(800, 800, { fit: sharp.fit.inside, withoutEnlargement: true })
      .jpeg({ quality: 50 })
      .toBuffer();
      
    return compressedImageBuffer;
  } catch (error) {
    console.error('Error compressing image:', error.message, error.stack);
    throw new Error('Image compression failed');
  }
};

export const uploadImages = async (req, res,next) => {
  console.log("Images:", req.files); // Should log files
  console.log("Body:", req.body);   // Body should be empty, that's expected

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

    // Ensure both images are provided
    if (!req.files || !req.files.originalImage || !req.files.compressedImage) {
      return res.status(400).send('Both images are required');
    }

    const originalImage = req.files.originalImage[0];
    const compressedImage = compressImage(req.files.originalImage[0]);

    // Upload images to Firebase Storage
    const originalImageUrl = await uploadFileToFirebase(
      originalImage.buffer,
      originalImage.originalname,
      'images/original'
    );
    const compressedImageUrl = await uploadFileToFirebase(
      compressedImage.buffer,
      compressedImage.originalname,
      'images/compressed'
    );

    // Save image metadata to the database
    const image = new Image({
      originalImage: originalImageUrl,
      compressedImage: compressedImageUrl,
    });

  
    req.images = image
    next()
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
};
