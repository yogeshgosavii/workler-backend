import asyncHandler from "express-async-handler";
import Approach from "../models/approachModel.js";
import notificationController from "./notificationController.js";

// Create a new document
const handleCreate = (Model) => async (req, res) => {
  try {
    const data = new Model({
      ...req.body,
    });
    
    await data.save();

    // Notify the user that they have been approached
    const notificationData = {
      userId: data.user,  // The user being approached
      related_to: data.employeer,  // The employer who approached the user
      notificationType: "approach",  // Notification type
      contentId:data.job._id,
      message: `You have been approached by ${req.user.username} for a job `,  // Custom message
    };

    const notificationResult = await notificationController.createNotification({ body: notificationData });

    res.status(201).json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
};


const handleCheckApproached = (Model) => async (req, res) => {
  try {
    const { userId, employeerId } = req.body;

    if (!userId || !employeerId) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "User ID and Employer ID are required",
        });
    }

    const data = await Model.find({
      user: userId,
      employeer: employeerId,
    }).populate({ path: "job", select: "job_role company_name description" });

    console.log("approached", data);
    res.json({ status: "success", data });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};


const handleGetApproachedUsers = (Model) => async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId)

    if (!userId) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "User ID is required",
        });
    }

    const approachDetails = await Model.find({
      employeer: userId,
            deletedBy: { $ne: userId }, // Exclude approaches where the user ID is in the deletedBy array

    })
      .populate({
        path: "job",
        model: "Job",
        select: "job_role company_name job_tags job_url",
      })
      .populate({
        path: "user",
        model: "User",
        select: "username personal_details location profileImage",
      });

    console.log("approached", approachDetails);
    res.json(approachDetails);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};

const handleGetApproaches = (Model) => async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate input
    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required",
      });
    }
    console.log("user", userId);
    

    // Fetch approach details excluding those deleted by the user
    const approachDetails = await Model.find({
      user: userId,
      deletedBy: { $ne: userId }, // Exclude approaches where the user ID is in the deletedBy array
    })
      .populate({
        path: "job",
        model: "Job",
      })
      .populate({
        path: "user",
        model: "User",
        select: "username personal_details location profileImage",
      });

    console.log("approached", approachDetails);
    res.json(approachDetails);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};


const handleUpdateApproachStatus = async (req, res) => {
  const { id, status } = req.body;
  try {
    const approach = await Approach.findById(id).populate('user', 'username').populate('employeer', 'username');

    if (!approach) {
      return res.status(404).send("Approach not found");
    }

    approach.status = status;
    const updatedApproach = await approach.save();

    // Notify the employer about the status change
    const notificationData = {
      userId: approach.employeer,  // The employer being notified
      related_to: approach.user,   // The user who changed the status
      notificationType: "ApproachStatus",  // Notification type
      message: `${approach.user.username} has updated the approach status to ${status}`,  // Custom message
    };

    const notificationResult = await notificationController.createNotification({ body: notificationData });

    if (!res.headersSent) {
      res.json(updatedApproach);
    }
  } catch (error) {
    console.error("Update approach details error:", error.message);

    if (!res.headersSent) {
      res.status(500).send("Error updating approach details");
    }
  }
};

const handleDeleteApproach = asyncHandler(async (req, res) => {
  const { id } = req.params; // Approach ID
  const userId = req.user._id; // Current user ID from request

  try {
    const approach = await Approach.findById(id);
    console.log(approach)

    if (!approach) {
      return res.status(404).json({ status: "error", message: "Approach not found" });
    }

    // Handle deletion logic
    if (!approach.deletedBy.includes(userId)) {
      // Add user ID to deletedBy array
      approach.deletedBy.push(userId);
      await approach.save();
      return res.status(200).json({ status: "success", message: "Approach marked as deleted for the user" });
    } else {
      // If the user ID already exists, remove the document entirely
      await Approach.findByIdAndDelete(id);
      return res.status(200).json({ status: "success", message: "Approach fully deleted" });
    }
  } catch (error) {
    console.error("Delete approach error:", error.message);
    return res.status(500).json({ status: "error", message: "Error deleting approach" });
  }
});


// CRUD operations for Approach
export const createApproach = asyncHandler(handleCreate(Approach));
export const checkApproached = asyncHandler(handleCheckApproached(Approach));
export const getApproachDetails = asyncHandler(handleGetApproachedUsers(Approach));
export const getUserApproachList = asyncHandler(handleGetApproaches(Approach));
export const updateApproachStatus = asyncHandler(handleUpdateApproachStatus);
export const deleteApproach = asyncHandler(handleDeleteApproach);
