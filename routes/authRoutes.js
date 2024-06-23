import { Router } from 'express';
const router = Router();
// import { signup, login, checkEmail , getUserDetails } from '../controllers/authController.js'; 
import {  checkEmail  } from '../controllers/authController.js'; 

// import { protect } from '../middleware/authMiddleware.js';

// router.post('/signup', signup);
// router.post('/login', login);
router.post('/check-email', checkEmail);

// Example of protecting a route with authentication middleware
// router.get('/user', getUserDetails);

export default router;
