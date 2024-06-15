const Skill = require('../models/skillModel');
const Education = require('../models/educationModel');
const PersonalDetails = require('../models/personalDetailsModel');
const ProjectDetails = require('../models/projectModel');
const WorkExperience = require('../models/workExperienceModel');
const Description = require('../models/descriptionModel')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');

// Function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Add Skill
exports.addSkill = async (req, res) => {
  try {
    const {name,level} = req.body.skills;
    console.log(name,level);
    
    const skill = new Skill({name,level});
    await skill.save();
    res.status(201).json(skill);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

// Get all Skills
exports.getSkill = async (req, res) => {
  try {
    const skills = await Skill.find();
    res.json(skills);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

// Update Skill
exports.updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findByIdAndUpdate(id, req.body, { new: true });
    res.json(skill);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

// Add Education
exports.addEducation = async (req, res) => {
  try {
    const {educationType, university, course, specialization, start_year, end_year, board, school_name, passing_out_year,grade, marks, maths, physics, chemistry } = req.body.education;

    const education = new Education({
      educationType,
      university,
      course,
      grade,
      specialization,
      start_year,
      end_year,
      board,
      school_name,
      passing_out_year,
      marks,
      maths,
      physics,
      chemistry,
    });

    await education.save();
    res.status(201).json(education);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

// Get all Educations
exports.getEducation = async (req, res) => {
  try {
    const educations = await Education.find();
    console.log(educations);
    res.json(educations);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

// Update Education
exports.updateEducation = async (req, res) => {

  try {
    // Validate ObjectId
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const educationData = req.body; // Directly using req.body now

    // Log received data for debugging
    console.log("Updating education with data:", educationData);

    const updatedEducation = await Education.findByIdAndUpdate(id, educationData, { new: true });

    if (!updatedEducation) {
      return res.status(404).json({ message: 'Education with that ID not found' });
    }

    res.json(updatedEducation);
  } catch (error) {
    console.error('Error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: 'Server Error' });
  }
};

// Add Personal Details
exports.addPersonalDetails = async (req, res) => {
  try {
    const personalDetails = new PersonalDetails(req.body);
    await personalDetails.save();
    res.status(201).json(personalDetails);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

// Get all Personal Details
exports.getPersonalDetails = async (req, res) => {
  try {
    const personalDetails = await PersonalDetails.find();
    res.json(personalDetails);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

// Update Personal Details
exports.updatePersonalDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const personalDetails = await PersonalDetails.findByIdAndUpdate(id, req.body, { new: true });
    res.json(personalDetails);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

// Add Project Details
exports.addProjectDetails = async (req, res) => {
  try {
    const projectDetails = new ProjectDetails(req.body);
    await projectDetails.save();
    res.status(201).json(projectDetails);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

// Get all Project Details
exports.getProjectDetails = async (req, res) => {
  try {
    const projectDetails = await ProjectDetails.find();
    res.json(projectDetails);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

// Update Project Details
exports.updateProjectDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const projectDetails = await ProjectDetails.findByIdAndUpdate(id, req.body, { new: true });
    res.json(projectDetails);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

// Add Work Experience
exports.addWorkExperience = async (req, res) => {
  try {
    const { currentWorking,
      type,
      companyName,
      jobTitle,
      annualSalary ,
      joiningDate ,
      leavingDate ,
      noticePeriod ,
      years,
      months,
      location,
      department,
      employmentType,
      stipend} = req.body.workExperience
    const workExperience = new WorkExperience({ currentWorking,
      type,
      companyName,
      jobTitle,
      annualSalary ,
      joiningDate ,
      leavingDate ,
      noticePeriod ,
      years,
      months,
      location,
      department,
      employmentType,
      stipend});
    await workExperience.save();
    res.status(201).json(workExperience);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

// Get all Work Experiences
exports.getWorkExperience = async (req, res) => {
  try {
    const workExperiences = await WorkExperience.find();
    res.json(workExperiences);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

// Update Work Experience
exports.updateWorkExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const workExperience = await WorkExperience.findByIdAndUpdate(id, req.body, { new: true });
    res.json(workExperience);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

// Add Description
exports.addDescription = async (req, res) => {
  try {
    const description = new Description(req.body);
    await description.save();
    res.status(201).json(description);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

// Get all Descriptions
exports.getDescription = async (req, res) => {
  try {
    const descriptions = await Description.find();
    res.json(descriptions);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

// Update Description
exports.updateDescription = async (req, res) => {
  try {
    const { id } = req.params;
    const description = await Description.findByIdAndUpdate(id, req.body, { new: true });
    res.json(description);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};


exports.deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    await Skill.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

// Delete Education
exports.deleteEducation = async (req, res) => {
  try {
    const { id } = req.params;
    await Education.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

// Delete Personal Details
exports.deletePersonalDetails = async (req, res) => {
  try {
    const { id } = req.params;
    await PersonalDetails.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

// Delete Project Details
exports.deleteProjectDetails = async (req, res) => {
  try {
    const { id } = req.params;
    await ProjectDetails.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

// Delete Work Experience
exports.deleteWorkExperience = async (req, res) => {
  try {
    const { id } = req.params;
    await WorkExperience.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

// Delete Description
exports.deleteDescription = async (req, res) => {
  try {
    const { id } = req.params;
    await Description.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

