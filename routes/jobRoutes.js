const express = require('express');
const {getJobs,addJob,updateJob,deleteJob } = require('../controllers/jobController');
import { protect } from '../middleware/authMiddleware.js';


const router = express.Router();

router.route('/jobs')
  .post(protect, addJob)
  .get(protect, getJobs);

router.route('/skills/:id')
  .put(protect, updateJob)
  .delete(protect, deleteJob);

module.exports = router;
