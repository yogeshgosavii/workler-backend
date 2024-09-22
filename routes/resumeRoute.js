import { Router } from 'express';
const router = Router();

import { protect } from '../middleware/authMiddleware.js';
import { addResume, getUserResumes} from '../controllers/resumeController.js';
import { fileMiddleware } from '../middleware/docMiddleware.js';
import configureUpload from '../middleware/uploadMiddleware.js';


const upload = configureUpload(2)

router.post('/add-resume',protect,upload,fileMiddleware, addResume);
router.get('/get-user-resumes',protect, getUserResumes);



export default router;
