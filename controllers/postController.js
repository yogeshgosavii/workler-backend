import asyncHandler from 'express-async-handler';
import Post from '../models/postModel.js';

// Create a new document
const handleCreate = (Model) => async (req, res) => {
  console.log(req.images);
  try {
    const data = new Model({ ...req.body,images : req.images,timestamp : new Date() , user: req.user._id });
    await data.save();
    res.status(201).json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

// Get all documents for a specific user
const handleUserGetAll = (Model) => async (req, res) => {
  try {
    const data = await Model.find({ user: req.user?._id });
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

// Get all documents (e.g., public posts)
const handleGetAll = (Model) => async (req, res) => {
  try {
    const data = await Model.find();
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

// Get a single document by ID
const handleGetById = (Model) => async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Model.findById(id);

    if (!data || data.user.toString() !== req.user?._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

// Update a document by ID
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

// Delete a document by ID
const handleDelete = (Model) => async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Model.findByIdAndDelete(id);

    if (!data) {
      return res.status(404).json({ message: 'Not found' });
    }

    return res.status(200).json({ message: 'Deletion successful' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// CRUD operations for Post
export const addPost = asyncHandler(handleCreate(Post));
export const getUserPosts = asyncHandler(handleUserGetAll(Post));
export const getPosts = asyncHandler(handleGetAll(Post));
export const getPostById = asyncHandler(handleGetById(Post));  // New export
export const updatePost = asyncHandler(handleUpdate(Post));
export const deletePost = asyncHandler(handleDelete(Post));

