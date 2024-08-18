import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  addSkill, getSkills, updateSkill, deleteSkill,
  addEducation, getEducation, updateEducation, deleteEducation,
  addProjectDetails, getProjectDetails, updateProjectDetails, deleteProjectDetails,
  addWorkExperience, getWorkExperience, updateWorkExperience, deleteWorkExperience,
  getQualificationsById,
} from '../controllers/profileController.js';

const router = express.Router();

// Routes for Skills
router.route('/skills')
  .post(protect, addSkill)
  .get(protect, getSkills);

router.route('/skills/:id')
  .put(protect, updateSkill)
  .delete(protect, deleteSkill);

// Routes for Education
router.route('/education')
  .post(protect, addEducation)
  .get(protect, getEducation);

router.route('/education/:id')
  .put(protect, updateEducation)
  .delete(protect, deleteEducation);



// Routes for Project Details
router.route('/projectDetails')
  .post(protect, addProjectDetails)
  .get(protect, getProjectDetails);

router.route('/projectDetails/:id')
  .put(protect, updateProjectDetails)
  .delete(protect, deleteProjectDetails);

// Routes for Work Experience
router.route('/workExperience')
  .post(protect, addWorkExperience)
  .get(protect, getWorkExperience);

router.route('/workExperience/:id')
  .put(protect, updateWorkExperience)
  .delete(protect, deleteWorkExperience);

// Routes for Description

router.route('/getQualification/:userId')
  .get( getQualificationsById)


export default router;
