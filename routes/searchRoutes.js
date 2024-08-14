import { Router } from 'express';
const router = Router();
import {searchByUsername } from '../controllers/searchController.js'; 

import { protect } from '../middleware/authMiddleware.js';



router.get('/search-by-username/:username',protect, searchByUsername);



export default router;
