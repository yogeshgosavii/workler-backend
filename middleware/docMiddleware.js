import sharp from 'sharp';
import { storage } from '../firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Function to upload a file to Firebase Storage
const uploadFileToFirebase = async (fileBuffer, fileName, folder) => {
  try {
    const fileRef = ref(storage, `${folder}/${Date.now()}_${fileName}`);
    const snapshot = await uploadBytes(fileRef, fileBuffer);
    const publicUrl = await getDownloadURL(snapshot.ref);
    console.log("url:",publicUrl)
    return publicUrl;
  } catch (error) {
    console.error('Error uploading file to Firebase:', error.message);
    throw new Error('File upload failed');
  }
};

// Function to compress images
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

// Middleware for handling image uploads with compression
export const imageMiddleware = async (req, res, next) => {
  try {
    if (!req.files || !req.files.files || req.files.files.length === 0) {
      return next();
    }
    console.log("images : ",req.files.files);
    

    const originalImages = req.files.files;
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

    req.images = {
      originalImage: uploadedImageUrls.map(url => url.originalImage),
      compressedImage: uploadedImageUrls.map(url => url.compressedImage)
    };

    next();
  } catch (error) {
    console.error('Error during image upload:', error.message, error.stack);
    res.status(500).send('Error during image upload');
  }
};

// Middleware for handling general file uploads
export const fileMiddleware = async (req, res, next) => {
  console.log(req.body);
  console.log("req:",req.files.files);

  
  try {
    if (!req.files.files || req.files.files.length === 0) {
      return next();
    }
    

    const uploadedFileUrls = await Promise.all(req.files.files.map(async (file) => {
      try {
        const fileUrl = await uploadFileToFirebase(file.buffer, file.originalname, 'files');

        return { fileUrl, filename: file.originalname };
      } catch (error) {
        console.error('Error processing file:', error.message);
        throw new Error('File processing failed');
      }
    }));

    req.filesUrls = uploadedFileUrls;
    console.log(uploadedFileUrls);
    
    next();
  } catch (error) {
    console.log('Error during file upload:', error.message, error.stack);
    res.status(500).send('Error during file upload');
  }
};

export default {
  imageMiddleware,
  fileMiddleware
};