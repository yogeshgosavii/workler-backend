import { Router } from 'express';
const router = Router();
import {searchByUsername, searchJobsByKeyWords , searchUserByKeyword } from '../controllers/searchController.js'; 

import { protect } from '../middleware/authMiddleware.js';



router.get('/search-by-username/:username',protect, searchByUsername);
router.get('/search-job-by-keyword', searchJobsByKeyWords);
router.get('/search-user-by-keyword', searchUserByKeyword);





export default router;
