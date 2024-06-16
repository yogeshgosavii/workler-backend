import Skill, { find, findByIdAndUpdate, findByIdAndDelete } from '../models/skillModel';
import Education from '../models/educationModel';
import PersonalDetails, { find as _find, findByIdAndUpdate as _findByIdAndUpdate, findByIdAndDelete as _findByIdAndDelete } from '../models/personalDetailsModel';
import ProjectDetails, { find as __find, findByIdAndUpdate as __findByIdAndUpdate, findByIdAndDelete as __findByIdAndDelete } from '../models/projectModel';
import WorkExperience, { find as ___find, findByIdAndUpdate as ___findByIdAndUpdate, findByIdAndDelete as ___findByIdAndDelete } from '../models/workExperienceModel';
import Description, { find as ____find, findByIdAndUpdate as ____findByIdAndUpdate, findByIdAndDelete as ____findByIdAndDelete } from '../models/descriptionModel';
import bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { default as mongoose } from 'mongoose';

// Function to generate JWT token
const generateToken = (userId) => {
  return sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Add Skill
export async function addSkill(req, res) {
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
}

// Get all Skills
export async function getSkill(req, res) {
  try {
    const skills = await find();
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
    const skill = await findByIdAndUpdate(id, req.body, { new: true });
    res.json(skill);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

// Add Education
export async function addEducation(req, res) {
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
}

// Get all Educations
export async function getEducation(req, res) {
  try {
    const educations = await Education.find();
    console.log(educations);
    res.json(educations);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

// Update Education
export async function updateEducation(req, res) {

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
    const personalDetails = await _find();
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
    const personalDetails = await _findByIdAndUpdate(id, req.body, { new: true });
    res.json(personalDetails);
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
    const projectDetails = await __find();
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
    const projectDetails = await __findByIdAndUpdate(id, req.body, { new: true });
    res.json(projectDetails);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

// Add Work Experience
export async function addWorkExperience(req, res) {
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
}

// Get all Work Experiences
export async function getWorkExperience(req, res) {
  try {
    const workExperiences = await ___find();
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
    const workExperience = await ___findByIdAndUpdate(id, req.body, { new: true });
    res.json(workExperience);
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
    const descriptions = await ____find();
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
    const description = await ____findByIdAndUpdate(id, req.body, { new: true });
    res.json(description);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}


export async function deleteSkill(req, res) {
  try {
    const { id } = req.params;
    await findByIdAndDelete(id);
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
    await _findByIdAndDelete(id);
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
    await __findByIdAndDelete(id);
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
    await ___findByIdAndDelete(id);
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
    await ____findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
}

