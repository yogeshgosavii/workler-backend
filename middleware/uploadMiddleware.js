import multer from 'multer';

// Configure multer to use memory storage
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage }).fields([
  { name: 'originalImage', maxCount: 1 }, // Field name and maximum count of files
  { name: 'compressedImage', maxCount: 1 }
]);

export default upload;
