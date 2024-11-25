import sharp from 'sharp';
import { storage } from '../firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Function to upload a file to Firebase Storage
const uploadFileToFirebase = async (fileBuffer, fileName, folder) => {
  try {
    // Create a new Promise with a timeout
    const uploadPromise = new Promise((resolve, reject) => {
      const fileRef = ref(storage, `${folder}/${Date.now()}_${fileName}`);
      
      // Start the file upload process
      const uploadTask = uploadBytes(fileRef, fileBuffer);
      
      uploadTask.then(async (snapshot) => {
        try {
          // Get the public URL of the uploaded file
          const publicUrl = await getDownloadURL(snapshot.ref);
          resolve(publicUrl); // Resolve with the URL
        } catch (error) {
          reject(new Error('Error getting download URL: ' + error.message));
        }
      }).catch((error) => {
        reject(new Error('Error uploading file to Firebase: ' + error.message));
      });

      // Set a timeout (e.g., 30 seconds)
      setTimeout(() => {
        reject(new Error('File upload timeout'));
      }, 30000); // Timeout after 30 seconds
    });

    // Wait for the upload promise to resolve or reject
    const publicUrl = await uploadPromise;
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
    console.log(req)
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
// Retry logic for uploading a file in case of failure
const uploadFileWithRetry = async (fileBuffer, fileName, folder, retries = 3) => {
  try {
    return await uploadFileToFirebase(fileBuffer, fileName, folder);
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying upload for file: ${fileName} (${retries} attempts left)`);
      return uploadFileWithRetry(fileBuffer, fileName, folder, retries - 1);
    } else {
      throw new Error(`File upload failed after retries: ${fileName}`);
    }
  }
};

// Function to upload multiple files sequentially
const uploadFilesSequentiallyWithRetry = async (files) => {
  const fileUrls = [];

  for (const file of files) {
    try {
      const fileUrl = await uploadFileWithRetry(file.buffer, file.originalname, 'files');
      fileUrls.push({ fileUrl, filename: file.originalname });
    } catch (error) {
      console.error('Error uploading file after retries:', error.message);
    }
  }

  return fileUrls;
};

// Middleware function for file handling
export const fileMiddleware = async (req, res, next) => {
  console.log(req.body);
  console.log("Files:", req.files ? req.files.files : 'No files');

  try {
    if (!req.files.files || req.files.files.length === 0) {
      return next(); // No files, proceed to the next middleware
    }

    // Upload files with retry logic
    const uploadedFileUrls = await uploadFilesSequentiallyWithRetry(req.files.files);

    // Attach uploaded file URLs to the request object
    req.filesUrls = uploadedFileUrls;
    console.log(uploadedFileUrls);

    next();  // Continue to the next middleware (e.g., controller)
  } catch (error) {
    console.error('Error during file upload:', error.message, error.stack);
    res.status(500).send('Error during file upload');
  }
};

export default {
  imageMiddleware,
  fileMiddleware
};
