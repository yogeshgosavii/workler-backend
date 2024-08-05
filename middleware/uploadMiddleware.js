import multer from 'multer';

// Function to configure multer with dynamic field names and counts
const configureUpload = (maxCount) => {
  const storage = multer.memoryStorage(); // Store files in memory

  // Create multer upload instance with the specified fields
  const upload = multer({ storage }).fields([
    { name: 'images', maxCount } 
  ]);

  return upload;
};

export default configureUpload;
