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

    // Validate inputs
    if (!userId || !employeerId) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "User ID and Employer ID are required",
        });
    }

    // Fetch data
    const data = await Model.find({
      user: userId,
      employeer: employeerId,
    }).populate({ path: "job", select: "job_role company_name description" });

    console.log("approached", data);

    // Return results
    res.json({ status: "success", data });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};

// CRUD operations for Post
export const createApproach = asyncHandler(handleCreate(Approach));
export const checkApproached = asyncHandler(handleCheckApproached(Approach));
