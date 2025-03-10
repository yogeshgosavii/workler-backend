import asyncHandler from "express-async-handler";
import { Job } from "../models/jobModel.js";
import Approach from "../models/approachModel.js";
import Application from "../models/applicationModel.js";


import {
  fetchJobDetailsFromRemotiveById,
  fetchJobByIdFromReed,
  getExternalJobs,
} from "../controllers/externalJobsController.js"; // Import your external jobs controller
import mongoose from "mongoose";

// Helper function to handle async/await and error responses
const handleCreate = (Model) => async (req, res) => {
  console.log(req);
  try {
    const data = new Model({ ...req.body, user: req.user._id });
    console.log(data);
    await data.save();
    res.status(201).json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
};

const handleCreateMultiple = (Model) => async (req, res) => {
  try {
    const jobsData = req.body; // Assuming jobs array is sent in req.body.jobs

    console.log("jobsData", jobsData);

    if (!Array.isArray(jobsData)) {
      return res.status(400).send("Expected an array of jobs");
    }

    const jobs = jobsData.map((job) => ({
      ...job,
      user: req.user._id, // Assign the user ID to each job
    }));

    const createdJobs = await Model.insertMany(jobs); // Save all jobs at once

    res.status(201).json(createdJobs);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
};

const handleGetAll = (Model) => async (req, res) => {
  try {
    // Fetch internal jobs from the database
    const internalJobs = await Job.find();

    // Fetch external jobs using the external jobs controller
    const externalJobs = await getExternalJobs(); // Call the function that fetches external jobs

    // Combine the results into a single array
    const allJobs = [...internalJobs, ...externalJobs];
    console.log("jobs", internalJobs);

    res.json(allJobs);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
};

// Export the function as usual

const handleGetById = (Model) => async (req, res) => {
  try {
    const { id,source } = req.params;

    // Find the document by ID
    let data = await fetchJobByIdFromReed(id)
    console.log("job:",data);
    

    if (!data && mongoose.Types.ObjectId.isValid(id)) {
      data = await Model.findById(id).populate("user").select("-password");
      if(!data){
        return res.status(404).send('Resource not found');

      }
    }

    if(!data){
      data = await fetchJobDetailsFromRemotiveById(id); // You can populate any referenced fields if needed

   }
  
   
    console.log("data",data);
    

   

    // Ensure the user is authorized to view this document

    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
};

const handleGetByUserId = (Model) => async (req, res) => {
  try {
    const { id } = req.params;

    console.log("userId",id)

    // Find the document by ID
    const data = await Model.find({ user: id }); // You can populate any referenced fields if needed
    console.log(data);

    if (!data) {
      return res.status(404).send("Resource not found");
    }

    // Ensure the user is authorized to view this document

    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
};

const handleUpdate = (Model) => async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Model.findById(id);

    Object.assign(data, req.body);
    const updatedData = await data.save();
    res.json(updatedData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
};

const handleDelete = (Model) => async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Model.findByIdAndDelete(id);

    if (!data) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await Approach.deleteMany({ job: data._id });
    await Application.deleteMany({ job: data._id });
    
    // Return a success message as JSON
    return res.status(200).json({ message: "Deletion successful" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const handleGetByIds = (Model) => async (req, res) => {
  try {
    const { ids } = req.body; // Assuming an array of job IDs is sent in req.body.ids
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).send("Expected a non-empty array of job IDs");
    }

    // Find all jobs by the array of IDs and ensure they belong to the authenticated user
    const jobs = await Model.find({
      _id: { $in: ids },
    });

    if (!jobs.length) {
      return res.status(404).send("No jobs found");
    }

    res.json(jobs);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
};

// CRUD operations for Job
export const addJob = asyncHandler(handleCreate(Job));
export const addMultipleJob = asyncHandler(handleCreateMultiple(Job));
export const getJobs = asyncHandler(handleGetAll(Job));
export const getJobsById = asyncHandler(handleGetById(Job));
export const getJobsByUserId = asyncHandler(handleGetByUserId(Job));

export const getJobsByIds = asyncHandler(handleGetByIds(Job));
export const updateJob = asyncHandler(handleUpdate(Job));
export const deleteJob = asyncHandler(handleDelete(Job));

// CRUD operations for Education
