const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// router.post('/signup', authController.signup);
// router.post('/login', authController.login);
router.post('/checkEmail', authController.checkEmail);

// Example of protecting a route with authentication middleware
router.get('/user', authMiddleware.protect, authController.getUserDetails);

module.exports = router;
