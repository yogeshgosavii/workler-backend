import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

import Application from "../models/applicationModel.js";
import notificationController from "./notificationController.js"; // Import the function

// Create a new document

const handleCreateApplication = (Model) => async (req, res) => {
  try {
    const data = new Model({
      ...req.body,
    });

    console.log(data);
    
    await data.save();

    // Create a notification for the employer when a new application is submitted
    const employerId = data.employeer;  // Assuming `employeer` field in application is the employer's ID
    const jobId = data.job;  // Assuming `job` field contains the job ID
    
    // Prepare notification data
    const notificationData = {
      userId: employerId,  // Send notification to the employer
      related_to: data.user,  // Related user (applicant)
      notificationType: "Application",  // Notification type
      message: `You have received a new application for job ID: ${jobId}`,
    };

    // Call createNotification directly with a mock req object
    await notificationController.createNotification({ body: notificationData }, res);

    res.status(201).json(data);
  } catch (error) {
    console.error("Error:", error);  // Log the complete error
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
      let  data = null
      
      if(mongoose.Types.ObjectId.isValid(jobId)){  
        data  = await Model.find({
        user: userId,
        job: jobId,
      });
    }
  
      console.log("applied", data);
  
      // Return results
      if(data?.length>0){
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
      if (!jobId ) {
        return res
          .status(400)
          .json({
            status: "error",
            message: "User ID and Job ID are required",
          });
      }
  
      // Fetch data
      let data = null

      if(mongoose.Types.ObjectId.isValid(jobId)){  
        data = await Model.find({
          job: jobId,
        });
    
        console.log("applied", data ||0);
      }
      // Return results
        res.json(data?.length || 0)

      
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
      if (!userId) {
        return res.status(400).json({
          status: "error",
          message: "User ID is required",
        });
      }
  
      // Fetch data excluding applications deleted by the user
      let applicationDetails;
  
      if (mongoose.Types.ObjectId.isValid(userId)) {
        applicationDetails = await Model.find({
          user: userId,
          deletedBy: { $ne: userId }, // Exclude applications where the user ID is in the deletedBy array
        })
          .populate({
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
          });
  
        console.log(applicationDetails);
      }
  
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

    // Validate inputs
    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required",
      });
    }

    // Fetch data excluding applications deleted by the user
    const applicationDetails = await Model.find({
      employeer: userId,
      deletedBy: { $ne: userId }, // Exclude applications where the user ID is in the deletedBy array
    })
      .populate({
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
      });

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

    // Create a notification for the applicant about the status update
    const applicantId = application.user; // Assuming `user` field in application is the applicant's ID
    const jobId = application.job;

    // Prepare notification data
    const notificationData = {
      userId: applicantId,
      related_to: application.employeer, // Related user (employer)
      notificationType: "ApplicationStatus", // Notification type
      message: `Your application status for job ID: ${jobId} has been updated to ${status}`,
    };

    // Use the notification controller's createNotification directly
    await notificationController.createNotification({ body: notificationData }, res);

    // Send the updated application as response
    res.json(updatedApplication);
  } catch (error) {
    console.error("Update application status error:", error); // Log the complete error
    
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return res.status(401).send("Invalid or expired token");
    }

    res.status(500).send("Error updating application status");
  }
};

const handleDeleteApplication = (Model) => async (req, res) => {
  try {
    const { id } = req.params; // ID of the application to delete
   
    const userId  = req.user._id; // User performing the deletion

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      console.log("Valid Application ID is required")

      return res.status(400).json({
        status: "error",
        message: "Valid Application ID is required",
      });
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      console.log("Valid User ID is required")
      return res.status(400).json({
        status: "error",
        message: "Valid User ID is required",
      });
    }

    // Find the application
    const application = await Model.findById(id);

    if (!application) {
      return res.status(404).json({ status: "error", message: "Application not found" });
    }

    // Check if `deletedBy` already includes the user ID
    const deletedBy = application.deletedBy || []; // Initialize if `deletedBy` is null

    if (!deletedBy.includes(userId)) {
      // Add the current user to `deletedBy`
      deletedBy.push(userId);
      application.deletedBy = deletedBy;

      if (deletedBy.length >= 2) {
        // If two users (candidate and employer) have deleted, delete the application
        await Model.findByIdAndDelete(id);
        return res.status(200).json({ message: "Application fully deleted" });
      }

      // Save the updated application with `deletedBy`
      await application.save();
      return res.status(200).json({ message: "Application deletion tracked", application });
    }

    res.status(200).json({ message: "User already marked as deleted", application });
  } catch (error) {
    console.error("Delete application error:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};



// CRUD operations for Post
export const createApplication = asyncHandler(handleCreateApplication(Application));
export const checkApplied = asyncHandler(handleCheckApplied(Application));
export const getJobApplicantsCount = asyncHandler(handleGetJobApplicantsCount(Application));
export const getUserApplications = asyncHandler(handleGetUserApplications(Application));
export const getEmployeerApplications = asyncHandler(handleGetEmployeerApplications(Application));
export const updateApplicationStatus = asyncHandler(handleUpdateApplicationStatus(Application));
export const deleteApplication = asyncHandler(handleDeleteApplication(Application));


