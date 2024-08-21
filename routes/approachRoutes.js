import { Router } from 'express';
const router = Router();
import {checkApproached, createApproach } from '../controllers/approachController.js'; 

import { protect } from '../middleware/authMiddleware.js';


router.post('/create-approach',protect, createApproach);
router.post('/check-approach',protect, checkApproached);




export default router;
