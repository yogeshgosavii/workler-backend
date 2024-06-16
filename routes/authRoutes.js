import { Router } from 'express';
const router = Router();
import { checkEmail, getUserDetails } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

// router.post('/signup', authController.signup);
// router.post('/login', authController.login);
// router.post('/check-email', checkEmail);

// Example of protecting a route with authentication middleware
router.get('/user', protect, getUserDetails);

export default router;
