import express from 'express';
import { uploadImages } from '../controllers/fileController.js'; 
import upload from '../middleware/uploadMiddleware.js'; // Adjust this path if needed

const router = express.Router();

// Use upload middleware here
router.post('/upload-images', upload, uploadImages);

export default router;
