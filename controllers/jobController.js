import asyncHandler from 'express-async-handler';
import Job from '../models/jobModel.js';


// Helper function to handle async/await and error responses
const handleCreate = (Model) => async (req, res) => {
  console.log(req)
  try {
    const data = new Model({ ...req.body, user: req.user._id });
    console.log(data)
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
    const data = await Model.findByIdAndDelete(id);

    if (!data) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Return a success message as JSON
    return res.status(200).json({ message: 'Deletion successful' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// CRUD operations for Job
export const addJob = asyncHandler(handleCreate(Job));
export const getJobs = asyncHandler(handleGetAll(Job));
export const updateJob = asyncHandler(handleUpdate(Job));
export const deleteJob = asyncHandler(handleDelete(Job));

// CRUD operations for Education

