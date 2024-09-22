import asyncHandler from "express-async-handler";

import Application from "../models/applicationModel.js";

// Create a new document
const handleCreateApplication = (Model) => async (req, res) => {
  try {
    const data = new Model({
      ...req.body,
    });

    console.log(data);
    
    await data.save();
    res.status(201).json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
};

const handleCheckApplied = (Model) => async (req, res) => {
    try {
      const { userId, jobId } = req.body;

      console.log(userId,jobId);
      
      // Validate inputs
      if (!userId || !jobId) {
        return res
          .status(400)
          .json({
            status: "error",
            message: "User ID and Job ID are required",
          });
      }
  
      // Fetch data
      const data = await Model.find({
        user: userId,
        job: jobId,
      });
  
      console.log("applied", data);
  
      // Return results
      if(data.length>0){
        res.json({exists : true})
      }
      else{
        res.json({exists : false})

      }
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ status: "error", message: "Server Error" });
    }
  };


  const handleGetJobApplicantsCount = (Model) => async (req, res) => {
    try {
      const { jobId } = req.params;

      
      // Validate inputs
      if (!jobId) {
        return res
          .status(400)
          .json({
            status: "error",
            message: "User ID and Job ID are required",
          });
      }
  
      // Fetch data
      const data = await Model.find({
        job: jobId,
      });
  
      console.log("applied", data);
  
      // Return results
        res.json(data.length)

      
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ status: "error", message: "Server Error" });
    }
  };

const handleGetUserApplications = (Model) => async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);
    
    // Validate inputs
    if (!userId ) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "User ID are required",
        });
    }

    // Fetch data
    const applicationDetails = await Model.find({
      user : userId
    }) .populate({
        path: "job", // The field to populate
        model: "Job", // The model to use for populating
      })
      .populate({
        path: "user", // The field to populate
        model: "User", // The model to use for populating
        select: "username personal_details location profileImage",
      })
      .populate({
        path: "resume", // The field to populate
        model: "Resume", // The model to use for populating
      })

    console.log(applicationDetails);
    
    // const skills = await Skill.find({user:approachDetails.user._id})
    // const workExperience = await WorkExperience.find({user:approachDetails.user._id})
    // const education = await Education.find({user:approachDetails.user._id})
    // const projects = await Project.find({user:approachDetails.user._id})




    // Return results
    res.json(applicationDetails);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};

const handleGetEmployeerApplications = (Model) => async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);
    
    // Validate inputs
    if (!userId ) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "User ID are required",
        });
    }

    // Fetch data
    const applicationDetails = await Model.find({
      employeer : userId
    }).populate({
        path: "job", // The field to populate
        model: "Job", // The model to use for populating
      })
      .populate({
        path: "user", // The field to populate
        model: "User", // The model to use for populating
        select: "username personal_details location profileImage",
      })
      .populate({
        path: "resume", // The field to populate
        model: "Resume", // The model to use for populating
      })

    console.log(applicationDetails);
    
   



    // Return results
    res.json(applicationDetails);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};

const handleUpdateApplicationStatus = (Model) => async (req, res) => {
  const { id, status } = req.body;
  try {
    const application = await Model.findById(id);

    if (!application) {
      return res.status(404).send("Application not found");
    }

    application.status = status;
    const updatedApplication = await application.save();

    res.json(updatedApplication);
  } catch (error) {
    console.error("Update application status error:", error.message);
    
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return res.status(401).send("Invalid or expired token");
    }

    res.status(500).send("Error updating application status");
  }
};



// CRUD operations for Post
export const createApplication = asyncHandler(handleCreateApplication(Application));
export const checkApplied = asyncHandler(handleCheckApplied(Application));
export const getJobApplicantsCount = asyncHandler(handleGetJobApplicantsCount(Application));
export const getUserApplications = asyncHandler(handleGetUserApplications(Application));
export const getEmployeerApplications = asyncHandler(handleGetEmployeerApplications(Application));
export const updateApplicationStatus = asyncHandler(handleUpdateApplicationStatus(Application));



