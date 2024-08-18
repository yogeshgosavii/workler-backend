import { Router } from 'express';
const router = Router();
import { signup, login,checkUsername, checkEmail ,updateUserDetails , getUserDetails, testAuth, getUserDetailsById } from '../controllers/authController.js'; 

import { protect } from '../middleware/authMiddleware.js';
import customUpload from '../middleware/uploadMiddleware.js';
import imageMiddleware from '../middleware/imageMiddleware.js';

const upload = customUpload(1)

router.post('/signup', signup);
router.post('/login', login);
router.post('/check-email', checkEmail);
router.post('/check-username', checkUsername);

router.route('/user').get(protect,getUserDetails);
router.route('/user/:userId').get(protect,getUserDetailsById);

router.route('/update-user').put(protect,upload,imageMiddleware,updateUserDetails);

router.route('/testAuth').get(testAuth);


export default router;
