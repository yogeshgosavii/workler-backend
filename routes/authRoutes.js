import { Router } from 'express';
const router = Router();
import { signup, login, checkUsername, checkEmail, updateUserDetails, getUserDetails, testAuth, getUserDetailsById, updatePassword, requestPasswordReset, resetPassword ,validateResetToken} from '../controllers/authController.js'; 
import { protect } from '../middleware/authMiddleware.js';
import customUpload from '../middleware/uploadMiddleware.js';
import { imageMiddleware } from '../middleware/docMiddleware.js';

const upload = customUpload(1);  // Limit file upload to 1 file

// Authentication routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/check-email', checkEmail);
router.post('/check-username', checkUsername);

// Password routes
router.put('/update-password', protect, updatePassword);
router.post('/request-password-reset', requestPasswordReset);  // Request password reset
router.post('/reset-password', resetPassword);  // Reset password with token
router.get('/validate-reset-token/:token', validateResetToken);  // Reset password with token

// User information routes
router.route('/user').get(protect, getUserDetails);
router.route('/user/:userId').get(protect, getUserDetailsById);

// User profile update with image handling
router.route('/update-user').put(protect, upload, imageMiddleware, updateUserDetails);

// Test route for authentication
router.route('/testAuth').get(testAuth);

export default router;
