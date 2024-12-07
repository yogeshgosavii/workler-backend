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
router.put(
    '/update-user',
    (req, res, next) => {
      console.time('Total Request Time'); // Start overall request timer
      console.time('Middleware Execution'); // Start middleware execution timer
      next(); // Continue to the next middleware
    },
    protect, // Authentication middleware
    (req, res, next) => {
      console.timeEnd('Middleware Execution'); // End middleware execution timer
      console.time('Image Upload'); // Start image upload timer
      next();
    },
    upload, // File upload middleware
    (req, res, next) => {
      console.timeEnd('Image Upload'); // End image upload timer
      console.time('Image Processing'); // Start image processing timer
      next();
    },
    imageMiddleware, // Image processing middleware
    (req, res, next) => {
      console.timeEnd('Image Processing'); // End image processing timer
      console.time('Request Processing'); // Start request processing timer
      next();
    },
    async (req, res, next) => {
      try {
        await updateUserDetails(req, res);
        console.timeEnd('Request Processing'); // End request processing timer
        console.timeEnd('Total Request Time'); // End total request time timer

      } catch (error) {
        next(error);
      }
    },
   
  );

// Test route for authentication
router.route('/testAuth').get(testAuth);

export default router;
