import { Router } from 'express';
const router = Router();
import {checkApproached, createApproach, deleteApproach, getApproachDetails, getUserApproachList, updateApproachStatus } from '../controllers/approachController.js'; 

import { protect } from '../middleware/authMiddleware.js';


router.post('/create-approach',protect, createApproach);
router.post('/check-approach',protect, checkApproached);
router.get('/get-approach/:userId',protect, getApproachDetails);
router.get('/get-user-approach/:userId',protect, getUserApproachList);
router.post('/update-approach-status',protect, updateApproachStatus);
router.delete("/:id",protect, deleteApproach);







export default router;
