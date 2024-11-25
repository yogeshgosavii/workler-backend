import { compressImage, uploadFileToFirebase } from './uploadUtilities.js';

// Middleware for handling image uploads
export const imageMiddleware = async (req, res, next) => {
  try {
    if (!req.files || !req.files.files || req.files.files.length === 0) {
      return next();
    }

    const originalImages = req.files.files;

    // Compress and upload images in parallel
    const uploadedImageUrls = await Promise.all(originalImages.map(async (image) => {
      const compressedImageBuffer = await compressImage(image.buffer);

      const compressedImageUrl = await uploadFileToFirebase(
        compressedImageBuffer,
        `compressed_${image.originalname}`,
        'images/compressed'
      );

      return { compressedImage: compressedImageUrl };
    }));

    req.images = {
      compressedImages: uploadedImageUrls.map(url => url.compressedImage)
    };

    next();
  } catch (error) {
    console.error('Error during image upload:', error.message, error.stack);
    res.status(500).send('Error during image upload');
  }
};

// Middleware for handling file uploads
export const fileMiddleware = async (req, res, next) => {
  try {
    if (!req.files || !req.files.files || req.files.files.length === 0) {
      return next(); // No files, proceed to the next middleware
    }

    const files = req.files.files;

    // Upload files in parallel with retry logic
    const uploadedFileUrls = await Promise.all(files.map(async (file) => {
      try {
        const fileUrl = await uploadFileToFirebase(file.buffer, file.originalname, 'files');
        return { fileUrl, filename: file.originalname };
      } catch (error) {
        console.error('Error processing file:', error.message);
        return null; // Continue even if one file fails
      }
    }));

    req.filesUrls = uploadedFileUrls.filter((url) => url !== null); // Filter out failed uploads

    next(); // Proceed to the next middleware (e.g., controller)
  } catch (error) {
    console.error('Error during file upload:', error.message, error.stack);
    res.status(500).send('Error during file upload');
  }
};
