import express from 'express';
import { uploadImages } from '../controllers/uploadController.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Use upload middleware here
router.post('/upload-images', upload, uploadImages);

export default router;
