// import cloudinary from 'cloudinary';
// import sharp from 'sharp';

// // Configure Cloudinary
// cloudinary.config({ 
//   cloud_name: 'dbfwaufc6', 
//   api_key: '529471728631638', 
//   api_secret: 'qXVJF1TTf-_sMzqy2-4ovHcd_Vc' // Click 'View API Keys' above to copy your API secret
// });

// // Function to upload a file to Cloudinary
// const uploadFileToCloudinary = async (fileBuffer, fileName, folder) => {
//   try {
//     return new Promise((resolve, reject) => {
//       const uploadStream = cloudinary.v2.uploader.upload_stream(
//         {
//           folder: folder,
//           public_id: `${Date.now()}_${fileName}`,
//           resource_type: 'auto', // Automatically detects image, video, or other media type
//         },
//         (error, result) => {
//           if (error) {
//             console.error('Error uploading file to Cloudinary:', error);
//             reject(new Error(`File upload failed: ${error.message}`));
//           } else {
//             resolve(result);
//           }
//         }
//       );

//       // Pipe the buffer data to the upload stream
//       uploadStream.end(fileBuffer);
//     });
//   } catch (error) {
//     console.error('Error uploading file to Cloudinary:', error);
//     throw new Error('File upload failed');
//   }
// };

// // Function to compress images
// const compressImage = async (imageBuffer) => {
//   try {
//     if (!Buffer.isBuffer(imageBuffer)) {
//       throw new Error('Expected image buffer, but received something else');
//     }

//     const compressedImageBuffer = await sharp(imageBuffer)
//       .resize(800, 800, { fit: sharp.fit.inside, withoutEnlargement: true })
//       .jpeg({ quality: 50 })
//       .toBuffer();

//     return compressedImageBuffer;
//   } catch (error) {
//     console.error('Error compressing image:', error.message, error.stack);
//     throw new Error('Image compression failed');
//   }
// };

// // Middleware for handling image uploads with compression
// export const imageMiddleware = async (req, res, next) => {
//   try {
//     if (!req.files || !req.files.files || req.files.files.length === 0) {
//       return next();
//     }

//     const originalImages = req.files.files;
//     if (!Array.isArray(originalImages)) {
//       return res.status(400).send('No images uploaded');
//     }

//     const uploadedImageUrls = await Promise.all(originalImages.map(async (image) => {
//       try {
//         if (!Buffer.isBuffer(image.buffer)) {
//           throw new Error('Expected image buffer, but received something else');
//         }

//         // Compress the image
//         const compressedImageBuffer = await compressImage(image.buffer);

//         // Upload original image to Cloudinary
//         const originalImageUrl = await uploadFileToCloudinary(
//           image.buffer,
//           image.originalname,
//           'images/original'
//         );

//         console.log("image",originalImageUrl)

//         // Upload compressed image to Cloudinary
//         const compressedImageUrl = await uploadFileToCloudinary(
//           compressedImageBuffer,
//           `compressed_${image.originalname}`,
//           'images/compressed'
//         );

//         return {
//           originalImage: originalImageUrl,
//           compressedImage: compressedImageUrl
//         };
//       } catch (error) {
//         console.error('Error processing image:', error.message);
//         throw new Error('Image processing failed');
//       }
//     }));

//     req.images = {
//       originalImage: uploadedImageUrls.map(url => url.originalImage),
//       compressedImage: uploadedImageUrls.map(url => url.compressedImage)
//     };

//     next();
//   } catch (error) {
//     console.error('Error during image upload:', error.message, error.stack);
//     res.status(500).send('Error during image upload');
//   }
// };

// // Middleware for handling general file uploads
// export const fileMiddleware = async (req, res, next) => {
//   try {
//     if (!req.files.files || req.files.files.length === 0) {
//       return next();
//     }

//     const uploadedFileUrls = await Promise.all(req.files.files.map(async (file) => {
//       try {
//         if (!Buffer.isBuffer(file.buffer)) {
//           throw new Error('Expected file buffer, but received something else');
//         }

//         const fileUrl = await uploadFileToCloudinary(file.buffer, file.originalname, 'files');

//         return { fileUrl, filename: file.originalname };
//       } catch (error) {
//         console.error('Error processing file:', error.message);
//         throw new Error('File processing failed');
//       }
//     }));

//     req.filesUrls = uploadedFileUrls;
    
//     next();
//   } catch (error) {
//     console.error('Error during file upload:', error.message, error.stack);
//     res.status(500).send('Error during file upload');
//   }
// };

// export default {
//   imageMiddleware,
//   fileMiddleware
// };



import sharp from 'sharp';
import { storage } from '../firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Function to upload a file to Firebase Storage
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

// Function to compress images
sharp.concurrency(4); // Adjust concurrency level

const compressImage = async (imageBuffer) => {
  try {
    const compressedImageBuffer = await sharp(imageBuffer)
      .resize(800, 800, { fit: sharp.fit.inside, withoutEnlargement: true })
      .jpeg({ quality: 50 })
      .withMetadata(false) // Skip unnecessary metadata
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