import { Router } from 'express';
const router = Router();
// import { signup, login, checkEmail , getUserDetails } from '../controllers/authController.js'; 


// Comment out the import of authController.js
// import auth from '../controllers/authController.js'; 

// Define a simple route to ensure the router is working
router.get('/test', (req, res) => {
    res.send('Test route is working');
});

// Comment out other routes until the issue is resolved
// router.post('/signup', signup);
// router.post('/login', login);
// router.post('/check-email', checkEmail);
// router.get('/user', getUserDetails);

export default router;
