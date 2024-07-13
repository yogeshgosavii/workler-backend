import multer from 'multer';
import path from 'path';

// Set up storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'originalImage') {
      cb(null, 'uploads/images/original/');
    } else if (file.fieldname === 'compressedImage') {
      cb(null, 'uploads/images/compressed/');
    } else {
      cb(new Error('Invalid file field'), false);
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

const upload = multer({ storage: storage }).fields([
  { name: 'originalImage', maxCount: 1 },
  { name: 'compressedImage', maxCount: 1 }
]);

export default upload;
