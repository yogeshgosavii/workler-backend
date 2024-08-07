import sharp from 'sharp';
import { storage } from '../firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from '../models/imageModel.js'; // Ensure this path is correct

const uploadFileToFirebase = async (fileBuffer, fileName, folder) => {
  const fileRef = ref(storage, `${folder}/${Date.now()}_${fileName}`);
  const snapshot = await uploadBytes(fileRef, fileBuffer);
  const publicUrl = await getDownloadURL(snapshot.ref);
  return publicUrl;
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
    }));

    // Save image metadata to the database
    const images= {
      originalImage: uploadedImageUrls.map(urls => urls.originalImage),
      compressedImage: uploadedImageUrls.map(urls => urls.compressedImage)
    };

    // const newImage = imageRecords;
    // await newImage.save();

    req.images = images;
    next();
  } catch (error) {
    console.error('Error during file upload:', error.message, error.stack);
    res.status(500).send('Error during file upload');
  }
};

export default imageMiddleware;
