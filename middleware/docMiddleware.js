import sharp from 'sharp';
import { storage } from '../firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Function to upload a file to Firebase Storage
const uploadFileToFirebase = async (fileBuffer, fileName, folder) => {
  const start = Date.now();
  try {
    const fileRef = ref(storage, `${folder}/${Date.now()}_${fileName}`);
    const snapshot = await uploadBytes(fileRef, fileBuffer);
    const fileUrl = await getDownloadURL(snapshot.ref);
    console.log(`Upload ${fileName} completed in ${Date.now() - start}ms`);
    return fileUrl;
  } catch (error) {
    console.error('Error uploading file to Firebase:', error.message);
    throw new Error('File upload failed');
  }
};

// Function to compress images with better efficiency
const compressImage = async (imageBuffer) => {
  const start = Date.now();
  try {
    const compressedBuffer = await sharp(imageBuffer)
      .resize(300, 300, { fit: sharp.fit.inside, withoutEnlargement: true }) // Smaller dimensions for faster processing
      .jpeg({ quality: 20 }) // Lower quality for faster upload
      .toBuffer();
    console.log(`Image compression completed in ${Date.now() - start}ms`);
    return compressedBuffer;
  } catch (error) {
    console.error('Error compressing image:', error.message);
    throw new Error('Image compression failed');
  }
};

// Middleware for handling image uploads with compression
// Middleware for handling image uploads with compression
export const imageMiddleware = async (req, res, next) => {
  try {
    if (!req.files || !req.files.files || req.files.files.length === 0) {
      return next();
    }

    const originalImages = req.files.files;
    const startProcess = Date.now();

    // Limit batch size for optimal performance
    const batchSize = 3; // Reduced batch size to lessen memory usage
    const uploadedImageUrls = [];

    for (let i = 0; i < originalImages.length; i += batchSize) {
      const batch = originalImages.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map(async (image) => {
          // Upload the original image
          const originalImageUrl = await uploadFileToFirebase(
            image.buffer,
            image.originalname,
            'images/original'
          );

          // Compress the image
          const compressedImageBuffer = await compressImage(image.buffer);

          // Upload the compressed image
          const compressedImageUrl = await uploadFileToFirebase(
            compressedImageBuffer,
            `compressed_${image.originalname}`,
            'images/compressed'
          );

          return { originalImage: originalImageUrl, compressedImage: compressedImageUrl };
        })
      );

      uploadedImageUrls.push(...batchResults);
    }

    req.images = {
      originalImage: uploadedImageUrls.map((url) => url.originalImage),
      compressedImage: uploadedImageUrls.map((url) => url.compressedImage),
    };

    console.log(`Total image upload process completed in ${Date.now() - startProcess}ms`);
    next();
  } catch (error) {
    console.error('Error during image upload:', error.message);
    res.status(500).send('Error during image upload');
  }
};


// Middleware for handling general file uploads
export const fileMiddleware = async (req, res, next) => {
  try {
    if (!req.files || !req.files.files || req.files.files.length === 0) {
      return next();
    }

    const startProcess = Date.now();
    const uploadedFiles = await Promise.all(
      req.files.files.map(async (file) => {
        const fileUrl = await uploadFileToFirebase(file.buffer, file.originalname, 'files');
        return { fileUrl, filename: file.originalname };
      })
    );

    req.filesUrls = uploadedFiles;
    console.log(`Total file upload process completed in ${Date.now() - startProcess}ms`);
    next();
  } catch (error) {
    console.error('Error during file upload:', error.message);
    res.status(500).send('Error during file upload');
  }
};

export default {
  imageMiddleware,
  fileMiddleware,
};
