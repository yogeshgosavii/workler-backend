import express from 'express';
import {
  createSaved,
  checkSaved,
  unsaveContent,
  getSpecificSaved,
  getSavedByType,
} from '../controllers/savedController.js';
import { protect } from '../middleware/authMiddleware.js'; // Assuming auth middleware

const router = express.Router();

// Create saved content
router.post('/create', protect, createSaved);

// Check if content is saved
router.post('/check', protect, checkSaved);

// Unsave a content by ID
router.delete('/unsave/:id', protect, unsaveContent);

// Get specific saved content by type (e.g., posts, profiles, jobs)
router.get('/specific/:contentType', protect, getSpecificSaved);


export default router;
