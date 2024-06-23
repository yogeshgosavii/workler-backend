// routes/authRoutes.js

import { Router } from 'express';
import { testAuth } from '../controllers/authController.js'; 

const router = Router();

// Simple test route to verify the controller is working
router.get('/testAuth', testAuth);

export default router;
