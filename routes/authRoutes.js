import { Router } from 'express';
const router = Router();
import { signup, login, checkEmail , getUserDetails, testAuth } from '../controllers/authController.js'; 

// import { protect } from '../middleware/authMiddleware.js';

// router.post('/signup', signup);
router.post('/login', login);
router.post('/check-email', checkEmail);

// Example of protecting a route with authentication middleware
// router.route('/user').get(protect, getUserDetails);
router.route('/testAuth').get(testAuth);


export default router;
