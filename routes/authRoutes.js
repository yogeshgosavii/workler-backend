import { Router } from 'express';
const router = Router();
import { signup, login,checkUsername, checkEmail ,updateUserDetails , getUserDetails, testAuth } from '../controllers/authController.js'; 

import { protect } from '../middleware/authMiddleware.js';

router.post('/signup', signup);
router.post('/login', login);
router.post('/check-email', checkEmail);
router.post('/check-username', checkUsername);



router.route('/user').get(getUserDetails);
router.route('/update-user').put(updateUserDetails);

router.route('/testAuth').get(testAuth);


export default router;
