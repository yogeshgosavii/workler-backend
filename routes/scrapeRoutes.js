import express from 'express'; // or require('express') if you're using CommonJS
import { scrapeJobDetails } from '../controllers/scrapeController.js'; // Adjust the import if using CommonJS

const router = express.Router();

// Define the route and pass the handler function
router.get('/getJobDetails', scrapeJobDetails);

export default router; // or module.exports = router; for CommonJS
