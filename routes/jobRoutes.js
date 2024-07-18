import express from 'express';
import {getJobs,addJob,updateJob,deleteJob } from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';


const router = express.Router();

router.route('/job')
  .post(protect, addJob)
  .get(protect, getJobs);

router.route('/job/:id')
  .put(protect, updateJob)
  .delete(protect, deleteJob);

export default router;
