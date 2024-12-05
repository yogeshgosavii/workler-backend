import sharp from 'sharp';
import { storage } from '../firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Function to upload a file to Firebase Storage
const uploadFileToFirebase = async (fileBuffer, fileName, folder) => {
  console.time(`Upload ${fileName}`);
  try {
    const fileRef = ref(storage, `${folder}/${Date.now()}_${fileName}`);
    const snapshot = await uploadBytes(fileRef, fileBuffer);
    console.timeEnd(`Upload ${fileName}`);
    return getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading file to Firebase:', error.message);
    throw new Error('File upload failed');
  }
};

// Function to compress images
const compressImage = async (imageBuffer) => {
  console.time('Image Compression');
  try {
    const compressedBuffer = await sharp(imageBuffer)
      .resize(800, 800, { fit: sharp.fit.inside, withoutEnlargement: true })
      .jpeg({ quality: 40 }) // Further reduced quality
      .toBuffer();
    console.timeEnd('Image Compression');
    return compressedBuffer;
  } catch (error) {
    console.error('Error compressing image:', error.message);
    throw new Error('Image compression failed');
  }
};

// Middleware for handling image uploads with compression
export const imageMiddleware = async (req, res, next) => {
  try {
    if (!req.files || !req.files.files || req.files.files.length === 0) {
      return next();
    }

    const originalImages = req.files.files;
    console.time('Total Image Upload Process');
    const uploadTasks = originalImages.map(async (image) => {
      console.time(`Processing Image ${image.originalname}`);
      
      const compressedImageBuffer = await compressImage(image.buffer);

      const [originalImageUrl, compressedImageUrl] = await Promise.all([
        uploadFileToFirebase(image.buffer, image.originalname, 'images/original'),
        uploadFileToFirebase(compressedImageBuffer, `compressed_${image.originalname}`, 'images/compressed'),
      ]);

      console.timeEnd(`Processing Image ${image.originalname}`);
      return { originalImage: originalImageUrl, compressedImage: compressedImageUrl };
    });

    const uploadedImageUrls = await Promise.all(uploadTasks);
    req.images = {
      originalImage: uploadedImageUrls.map((url) => url.originalImage),
      compressedImage: uploadedImageUrls.map((url) => url.compressedImage),
    };

    console.timeEnd('Total Image Upload Process');
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

    console.time('Total File Upload Process');
    const uploadedFiles = await Promise.all(
      req.files.files.map(async (file) => {
        console.time(`Uploading File ${file.originalname}`);
        const fileUrl = await uploadFileToFirebase(file.buffer, file.originalname, 'files');
        console.timeEnd(`Uploading File ${file.originalname}`);
        return { fileUrl, filename: file.originalname };
      })
    );

    req.filesUrls = uploadedFiles;
    console.timeEnd('Total File Upload Process');
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
