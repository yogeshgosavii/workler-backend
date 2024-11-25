import sharp from 'sharp';
import { storage } from '../firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Chunked upload function
const uploadFileInChunks = async (fileBuffer, fileName, folder) => {
  const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB
  const fileChunks = [];
  
  for (let i = 0; i < fileBuffer.length; i += CHUNK_SIZE) {
    fileChunks.push(fileBuffer.slice(i, i + CHUNK_SIZE));
  }

  const fileRef = ref(storage, `${folder}/${Date.now()}_${fileName}`);
  const uploadTask = uploadBytes(fileRef, new Blob(fileChunks));

  return new Promise((resolve, reject) => {
    uploadTask.then(async (snapshot) => {
      try {
        const publicUrl = await getDownloadURL(snapshot.ref);
        resolve(publicUrl);
      } catch (error) {
        reject(new Error('Error getting download URL: ' + error.message));
      }
    }).catch((error) => {
      reject(new Error('Chunk upload failed: ' + error.message));
    });
  });
};

// Retry logic for uploads
const retryUpload = async (uploadFunction, retries = 3) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await uploadFunction();
    } catch (error) {
      if (attempt < retries - 1) {
        console.log(`Retrying upload (attempt ${attempt + 2} of ${retries})`);
      } else {
        throw new Error('Upload failed after retries: ' + error.message);
      }
    }
  }
};

// Function to upload to Firebase (with retry)
export const uploadFileToFirebase = async (fileBuffer, fileName, folder) => {
  return retryUpload(() => uploadFileInChunks(fileBuffer, fileName, folder));
};

// Image compression function
export const compressImage = async (imageBuffer) => {
  try {
    const compressedImageBuffer = await sharp(imageBuffer)
      .resize(800, 800, { fit: sharp.fit.inside, withoutEnlargement: true })
      .jpeg({ quality: 50 })
      .toBuffer();
    return compressedImageBuffer;
  } catch (error) {
    console.error('Error compressing image:', error.message);
    throw new Error('Image compression failed');
  }
};
