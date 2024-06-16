import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Skill from '../models/skillModel.js';
import Education from '../models/educationModel.js';
import PersonalDetails from '../models/personalDetailsModel.js';
import ProjectDetails from '../models/projectModel.js';
import WorkExperience from '../models/workExperienceModel.js';
import Description from '../models/descriptionModel.js';
import { jwtSecret } from '../config.js'; // Assuming you have JWT secret defined in config.js

// Function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, jwtSecret, { expiresIn: '1h' });
};

// Example of protected route middleware to verify token
export async function protect(req, res, next) {
  let token;

  // Check if token is present in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token found
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, jwtSecret);

    // Set user on request object for further use
    req.user = { id: decoded.userId }; // Assuming you need only userId

    next(); // Move to the next middleware
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
}

// Add Skill
export async function addSkill(req, res) {
  try {
    const userId = req.user.id; // Get userId from authenticated request

    const { name, level } = req.body.skills;
    const skill = new Skill({ name, level });

    // Example usage of generateToken with userId
    const token = generateToken(userId);

    await skill.save();
    res.status(201).json({ skill, token }); // Include token in response if needed
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

// Get all Skills
export async function getSkill(req, res) {
  try {
    const skills = await Skill.find();
    res.json(skills);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

// Update Skill
export async function updateSkill(req, res) {
  try {
    const { id } = req.params;
    const skill = await Skill.findByIdAndUpdate(id, req.body, { new: true });
    res.json(skill);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

// Add Education
export async function addEducation(req, res) {
  try {
    const education = new Education(req.body.education);
    await education.save();
    res.status(201).json(education);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

// Get all Educations
export async function getEducation(req, res) {
  try {
    const educations = await Education.find();
    res.json(educations);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

// Update Education
export async function updateEducation(req, res) {
  try {
    const { id } = req.params;
    const updatedEducation = await Education.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedEducation);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

// Add Personal Details
export async function addPersonalDetails(req, res) {
  try {
    const personalDetails = new PersonalDetails(req.body);
    await personalDetails.save();
    res.status(201).json(personalDetails);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

// Get all Personal Details
export async function getPersonalDetails(req, res) {
  try {
    const personalDetails = await PersonalDetails.find();
    res.json(personalDetails);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

// Update Personal Details
export async function updatePersonalDetails(req, res) {
  try {
    const { id } = req.params;
    const updatedPersonalDetails = await PersonalDetails.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedPersonalDetails);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

// Add Project Details
export async function addProjectDetails(req, res) {
  try {
    const projectDetails = new ProjectDetails(req.body);
    await projectDetails.save();
    res.status(201).json(projectDetails);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

// Get all Project Details
export async function getProjectDetails(req, res) {
  try {
    const projectDetails = await ProjectDetails.find();
    res.json(projectDetails);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

// Update Project Details
export async function updateProjectDetails(req, res) {
  try {
    const { id } = req.params;
    const updatedProjectDetails = await ProjectDetails.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedProjectDetails);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

// Add Work Experience
export async function addWorkExperience(req, res) {
  try {
    const workExperience = new WorkExperience(req.body.workExperience);
    await workExperience.save();
    res.status(201).json(workExperience);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

// Get all Work Experiences
export async function getWorkExperience(req, res) {
  try {
    const workExperiences = await WorkExperience.find();
    res.json(workExperiences);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

// Update Work Experience
export async function updateWorkExperience(req, res) {
  try {
    const { id } = req.params;
    const updatedWorkExperience = await WorkExperience.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedWorkExperience);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

// Add Description
export async function addDescription(req, res) {
  try {
    const description = new Description(req.body);
    await description.save();
    res.status(201).json(description);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

// Get all Descriptions
export async function getDescription(req, res) {
  try {
    const descriptions = await Description.find();
    res.json(descriptions);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

// Update Description
export async function updateDescription(req, res) {
  try {
    const { id } = req.params;
    const updatedDescription = await Description.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedDescription);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

// Delete Skill
export async function deleteSkill(req, res) {
  try {
    const { id } = req.params;
    await Skill.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

// Delete Education
export async function deleteEducation(req, res) {
  try {
    const { id } = req.params;
    await Education.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

// Delete Personal Details
export async function deletePersonalDetails(req, res) {
  try {
    const { id } = req.params;
    await PersonalDetails.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

// Delete Project Details
export async function deleteProjectDetails(req, res) {
  try {
    const { id } = req.params;
    await ProjectDetails.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

// Delete Work Experience
export async function deleteWorkExperience(req, res) {
  try {
    const { id } = req.params;
    await WorkExperience.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

// Delete Description
export async function deleteDescription(req, res) {
  try {
    const { id } = req.params;
    await Description.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

