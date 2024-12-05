import sharp from 'sharp';
import { storage } from '../firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from '../models/imageModel.js'; // Ensure this path is correct

const uploadFileToFirebase = async (fileBuffer, fileName, folder) => {
  try {
    const fileRef = ref(storage, `${folder}/${Date.now()}_${fileName}`);
    const snapshot = await uploadBytes(fileRef, fileBuffer);
    const publicUrl = await getDownloadURL(snapshot.ref);
    return publicUrl;
  } catch (error) {
    console.error('Error uploading file to Firebase:', error.message);
    throw new Error('File upload failed');
  }
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

export const imageMiddleware = async (req, res, next) => {
  console.log('Files:', req.files); // Check this output
  console.log('Body:', req.body);

  try {
    if (!req.files || !req.files.images || req.files.images.length === 0) {
      return next();
    }

    const originalImages = req.files.images;
    if (!Array.isArray(originalImages)) {
      return res.status(400).send('No images uploaded');
    }

    const uploadedImageUrls = await Promise.all(originalImages.map(async (image) => {
      try {
        const compressedImageBuffer = await compressImage(image.buffer);

        const originalImageUrl = await uploadFileToFirebase(
          image.buffer,
          image.originalname,
          'images/original'
        );

        const compressedImageUrl = await uploadFileToFirebase(
          compressedImageBuffer,
          `compressed_${image.originalname}`,
          'images/compressed'
        );

        return {
          originalImage: originalImageUrl,
          compressedImage: compressedImageUrl
        };
      } catch (error) {
        console.error('Error processing image:', error.message);
        throw new Error('Image processing failed');
      }
    }));

    // Save image metadata to the database (if needed)
    const images = {
      originalImage: uploadedImageUrls.map(urls => urls.originalImage),
      compressedImage: uploadedImageUrls.map(urls => urls.compressedImage)
    };

    req.images = images;
    next();
  } catch (error) {
    console.error('Error during file upload:', error.message, error.stack);
    res.status(500).send('Error during file upload');
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
