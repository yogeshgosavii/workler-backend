import { Router } from 'express';
const router = Router();
import {getEducation } from '../controllers/profileController';

// Skill routess
// router.post('/skills', addSkill);
// router.get('/skills', getSkill);
// router.put('/skills/:id', updateSkill);
// router.delete('/skills/:id', deleteSkill);

// // Education routes
// router.post('/educations', addEducation);
router.get('/educations', getEducation);
// router.put('/educations/:id', updateEducation);
// router.delete('/educations/:id', deleteEducation);

// // Personal Details routes
// router.post('/personal-details', addPersonalDetails);
// router.get('/personal-details', getPersonalDetails);
// router.put('/personal-details/:id', updatePersonalDetails);
// router.delete('/personal-details/:id', deletePersonalDetails);

// // Project Details routes
// router.post('/projects', addProjectDetails);
// router.get('/projects', getProjectDetails);
// router.put('/projects/:id', updateProjectDetails);
// router.delete('/projects/:id', deleteProjectDetails);

// // Work Experience routes
// router.post('/work-experiences', addWorkExperience);
// router.get('/work-experiences', getWorkExperience);
// router.put('/work-experiences/:id', updateWorkExperience);
// router.delete('/work-experiences/:id', deleteWorkExperience);

// // Description routes
// router.post('/descriptions', addDescription);
// router.get('/descriptions', getDescription);
// router.put('/descriptions/:id', updateDescription);
// router.delete('/descriptions/:id', deleteDescription);

export default router;
