import { Router } from 'express';
const router = Router();

import { protect } from '../middleware/authMiddleware.js';
import { checkApplied, createApplication, deleteApplication, getEmployeerApplications, getJobApplicantsCount, getUserApplications, updateApplicationStatus } from '../controllers/applicationController.js';


router.post('/create-application',protect, createApplication);
router.post('/check-applied',protect, checkApplied);
router.get('/get-job-applicants-count/:jobId',protect, getJobApplicantsCount);
router.get('/get-user-application/:userId',protect, getUserApplications);
router.get('/get-employeer-application/:userId',protect, getEmployeerApplications);
router.post('/update-application-status',protect, updateApplicationStatus);
router.delete("/:id",protect, deleteApplication);







export default router;
