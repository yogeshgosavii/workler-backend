import { Router } from 'express';
const router = Router();
import { createInterview, getEmployeerInterviews, getUserInterviews } from '../controllers/interviewController.js'; 

import { protect } from '../middleware/authMiddleware.js';


router.post('/create-interview',protect,createInterview );
router.get('/get-user-interviews/:userId',protect, getUserInterviews);
router.get('/get-employeer-interviews/:userId',protect,getEmployeerInterviews );









export default router;
