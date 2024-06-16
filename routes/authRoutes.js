import { Router } from 'express';
const router = Router();
import { signup, login, checkEmail, getUserDetails } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

router.post('/signup', signup);
router.post('/login', login);
router.post('/check-email', checkEmail);

// Example of protecting a route with authentication middleware
router.get('/user', protect, getUserDetails);

export default router;
