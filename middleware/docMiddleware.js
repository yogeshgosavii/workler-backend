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

// Function to compress images
const compressImage = async (imageBuffer) => {
  try {
    return await sharp(imageBuffer)
      .resize({
        width: 1200, // Smaller dimensions for faster resizing
        height: 1200,
        fit: sharp.fit.inside,
        withoutEnlargement: true
      })
      .jpeg({
        quality: 50, // Lower quality for faster processing
        progressive: true
      })
      .toBuffer();
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
    if (!Array.isArray(originalImages)) {
      return res.status(400).send('No images uploaded');
    }

    // Upload both original and compressed images
    const uploadedImageUrls = await Promise.all(
      originalImages.map(async (image) => {
        try {
          const [compressedBuffer, originalUrl, compressedUrl] = await Promise.all([
            compressImage(image.buffer),
            uploadFileToFirebase(image.buffer, image.originalname, 'images/original'), // Upload original
            uploadFileToFirebase(await compressImage(image.buffer), `compressed_${image.originalname}`, 'images/compressed') // Upload compressed
          ]);

          return {
            originalImage: originalUrl,
            compressedImage: compressedUrl
          };
        } catch (error) {
          console.error('Error processing image:', error.message);
          throw new Error('Image processing failed');
        }
      })
    );

    req.images = {
      originalImage: uploadedImageUrls.map((url) => url.originalImage),
      compressedImage: uploadedImageUrls.map((url) => url.compressedImage)
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
