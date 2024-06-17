import asyncHandler from 'express-async-handler';
import Skill from '../models/skillModel.js';
import Education from '../models/educationModel.js';
import PersonalDetails from '../models/personalDetailsModel.js';
import ProjectDetails from '../models/projectModel.js';
import WorkExperience from '../models/workExperienceModel.js';
import Description from '../models/descriptionModel.js';

// Helper function to handle async/await and error responses
const handleCreate = (Model) => async (req, res) => {
  console.log(req)
  try {
    const data = new Model({ ...req.body, user: req.user._id });
    await data.save();
    res.status(201).json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

const handleGetAll = (Model) => async (req, res) => {
  try {
    const data = await Model.find({ user: req.user?._id });
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

const handleUpdate = (Model) => async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Model.findById(id);

    if (!data || data.user.toString() !== req.user?._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    Object.assign(data, req.body);
    const updatedData = await data.save();
    res.json(updatedData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

const handleDelete = (Model) => async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Model.findById(id);

    if (!data || data.user.toString() !== req.user?._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await data.remove();
    res.status(204).send();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

// CRUD operations for Skill
export const addSkill = asyncHandler(handleCreate(Skill));
export const getSkills = asyncHandler(handleGetAll(Skill));
export const updateSkill = asyncHandler(handleUpdate(Skill));
export const deleteSkill = asyncHandler(handleDelete(Skill));

// CRUD operations for Education
export const addEducation = asyncHandler(handleCreate(Education));
export const getEducation = asyncHandler(handleGetAll(Education));
export const updateEducation = asyncHandler(handleUpdate(Education));
export const deleteEducation = asyncHandler(handleDelete(Education));

// CRUD operations for Personal Details
export const addPersonalDetails = asyncHandler(handleCreate(PersonalDetails));
export const getPersonalDetails = asyncHandler(handleGetAll(PersonalDetails));
export const updatePersonalDetails = asyncHandler(handleUpdate(PersonalDetails));
export const deletePersonalDetails = asyncHandler(handleDelete(PersonalDetails));

// CRUD operations for Project Details
export const addProjectDetails = asyncHandler(handleCreate(ProjectDetails));
export const getProjectDetails = asyncHandler(handleGetAll(ProjectDetails));
export const updateProjectDetails = asyncHandler(handleUpdate(ProjectDetails));
export const deleteProjectDetails = asyncHandler(handleDelete(ProjectDetails));

// CRUD operations for Work Experience
export const addWorkExperience = asyncHandler(handleCreate(WorkExperience));
export const getWorkExperience = asyncHandler(handleGetAll(WorkExperience));
export const updateWorkExperience = asyncHandler(handleUpdate(WorkExperience));
export const deleteWorkExperience = asyncHandler(handleDelete(WorkExperience));

// CRUD operations for Description
export const addDescription = asyncHandler(handleCreate(Description));
export const getDescription = asyncHandler(handleGetAll(Description));
export const updateDescription = asyncHandler(handleUpdate(Description));
export const deleteDescription = asyncHandler(handleDelete(Description));
