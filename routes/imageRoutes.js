import express from 'express';
import { uploadImages } from '../controllers/imageController.js'; 
import upload from '../middleware/uploadMiddleware.js'; // Adjust this path if needed
import imageMiddleware from '../middleware/imageMiddleware.js';

const router = express.Router();

// Use upload middleware here
router.post('/upload-images',upload, imageMiddleware);

export default router;
