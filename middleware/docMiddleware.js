import sharp from 'sharp';
import { storage } from '../firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Upload file to Firebase
const uploadFileToFirebase = async (fileBuffer, fileName, folder) => {
  const fileRef = ref(storage, `${folder}/${Date.now()}_${fileName}`);
  const snapshot = await uploadBytes(fileRef, fileBuffer);
  return getDownloadURL(snapshot.ref);
};

// Compress image using optimal settings
const compressImage = async (imageBuffer) => {
  return sharp(imageBuffer)
    .resize({ width: 640, height: 640, fit: sharp.fit.contain })
    .webp({ quality: 30 }) // Using WebP for better compression
    .toBuffer();
};

// Middleware for efficient image upload with parallel processing
export const imageMiddleware = async (req, res, next) => {
  try {
    if (!req.files || !req.files.files || req.files.files.length === 0) {
      return next();
    }

    const originalImages = req.files.files;

    if (!Array.isArray(originalImages)) {
      return res.status(400).send('No images uploaded');
    }

    // Perform compression and upload both original and compressed images in parallel
    const uploadedImageUrls = await Promise.all(
      originalImages.map(async (image) => {
        // Compress the image in parallel with the upload
        const compressedBuffer = await compressImage(image.buffer);

        // Upload both the original and compressed images in parallel
        const [originalUrl, compressedUrl] = await Promise.all([
          uploadFileToFirebase(image.buffer, image.originalname, 'images/original'), // Original upload
          uploadFileToFirebase(compressedBuffer, `compressed_${image.originalname}`, 'images/compressed'), // Compressed upload
        ]);

        return {
          originalImage: originalUrl,
          compressedImage: compressedUrl,
        };
      })
    );

    // Attach both original and compressed image URLs to the request object
    req.images = {
      originalImage: uploadedImageUrls.map((url) => url.originalImage),
      compressedImage: uploadedImageUrls.map((url) => url.compressedImage),
    };

    next();
  } catch (error) {
    console.error('Error during image upload:', error.message);
    res.status(500).send('Error during image upload');
  }
};


// Middleware for handling general file uploads
export const fileMiddleware = async (req, res, next) => {
  // try {
  //   if (!req.files.files || req.files.files.length === 0) {
  //     return next();
  //   }

  //   const uploadedFileUrls = await Promise.all(req.files.files.map(async (file) => {
  //     try {
  //       return {
  //         fileUrl: await uploadFileToFirebase(file.buffer, file.originalname, 'files'),
  //         filename: file.originalname
  //       };
  //     } catch (error) {
  //       console.error('Error processing file:', error.message);
  //       throw new Error('File processing failed');
  //     }
  //   }));

  //   req.filesUrls = uploadedFileUrls;
  //   next();
  // } catch (error) {
  //   console.error('Error during file upload:', error.message);
  //   res.status(500).send('Error during file upload');
  // }
};

export default {
  imageMiddleware,
  fileMiddleware
};
