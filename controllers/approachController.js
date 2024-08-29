import asyncHandler from "express-async-handler";
import Approach from "../models/approachModel.js";

// Create a new document
const handleCreate = (Model) => async (req, res) => {
  try {
    const data = new Model({
      ...req.body,
    });
    await data.save();
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

    if (!userId) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "User ID is required",
        });
    }

    const approachDetails = await Model.find({
      user: userId,
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
    const approach = await Approach.findById(id);

    if (!approach) {
      return res.status(404).send("Approach not found");
    }

    approach.status = status;

    const updatedApproach = await approach.save();

    if (!res.headersSent) {
      res.json(updatedApproach);
    }
  } catch (error) {
    console.error("Update approach details error:", error.message);

    if (error instanceof jwt.TokenExpiredError) {
      if (!res.headersSent) {
        return res.status(401).send("Token expired");
      }
    }

    if (error.name === "JsonWebTokenError") {
      if (!res.headersSent) {
        return res.status(401).send("Invalid token");
      }
    }

    if (!res.headersSent) {
      res.status(500).send("Error updating approach details");
    }
  }
};

// CRUD operations for Approach
export const createApproach = asyncHandler(handleCreate(Approach));
export const checkApproached = asyncHandler(handleCheckApproached(Approach));
export const getApproachDetails = asyncHandler(handleGetApproachedUsers(Approach));
export const getUserApproachList = asyncHandler(handleGetApproaches(Approach));
export const updateApproachStatus = asyncHandler(handleUpdateApproachStatus);
