import sharp from 'sharp';
import { storage } from '../firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Function to upload a file to Firebase Storage
const uploadFileToFirebase = async (fileBuffer, fileName, folder) => {
  try {
    const fileRef = ref(storage, `${folder}/${Date.now()}_${fileName}`);
    const snapshot = await uploadBytes(fileRef, fileBuffer);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading file to Firebase:', error.message);
    throw new Error('File upload failed');
  }
};

// Function to compress images more efficiently
const compressImage = async (imageBuffer) => {
  try {
    return await sharp(imageBuffer)
      .resize(500, 500, { fit: sharp.fit.inside, withoutEnlargement: true }) // Resize for faster processing
      .jpeg({ quality: 30 }) // Lower quality for better performance
      .toBuffer();
  } catch (error) {
    console.error('Error compressing image:', error.message);
    throw new Error('Image compression failed');
  }
};

// Middleware for handling image uploads with compression
export const imageMiddleware = async (req, res, next) => {
  const startProcess = Date.now();
  try {
    if (!req.files || !req.files.files || req.files.files.length === 0) {
      return next();
    }

    const originalImages = req.files.files;
    const uploadedImageUrls = [];

    // Parallelize image compression and upload
    const imageUploadPromises = originalImages.map(async (image) => {
      console.log(`Processing image: ${image.originalname}`);
      
      // Compress the image
      const compressedImageBuffer = await compressImage(image.buffer);
      // Upload both original and compressed images concurrently
      const [originalImageUrl, compressedImageUrl] = await Promise.all([
        uploadFileToFirebase(image.buffer, image.originalname, 'images/original'),
        uploadFileToFirebase(compressedImageBuffer, `compressed_${image.originalname}`, 'images/compressed')
      ]);

      return {
        originalImage: originalImageUrl,
        compressedImage: compressedImageUrl,
      };
    });

    // Wait for all image uploads to complete
    const imageResults = await Promise.all(imageUploadPromises);

    uploadedImageUrls.push(...imageResults);

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
