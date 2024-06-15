const express = require('express');
const { getAllJobs, createJob, getJobsFromThirdParty } = require('../controllers/jobController');
const validateJobData = require('../middleware/validateJobData');

const router = express.Router();

router.get('/all-jobs', getAllJobs);
router.post('/create-job', validateJobData, createJob);
router.get('/third-party', getJobsFromThirdParty);

module.exports = router;
