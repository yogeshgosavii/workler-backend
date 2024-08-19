import express from 'express';
import {getJobs,addJob,addMultipleJob,updateJob,deleteJob, getJobsById ,getJobsByIds} from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';


const router = express.Router();

router.route('/job')
  .post(protect, addJob)
  .get(protect, getJobs);

  router.route('/multiple-job')
  .post(protect, addMultipleJob)

  router.route('/get-multiple-job')
  .post(protect, getJobsByIds)

  
router.route('/job/:id')
  .get(protect,getJobsById)
  .put(protect, updateJob)
  .delete(protect, deleteJob);

export default router;
