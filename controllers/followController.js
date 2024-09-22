import asyncHandler from "express-async-handler";
import Follow from "../models/followModel.js";

// Create a new document
const handleCreateFollow = (Model) => async (req, res) => {
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

// Get followers of a user
const handleGetFollowers = (Model) => async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);
    
    // Validate inputs
    if (!userId) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "User ID is required",
        });
    }

    // Fetch data
    const followDetails = await Model.find({
      following: userId,
    })
    .populate({
      path: "user", // The field to populate
      model: "User", // The model to use for populating
      select: "username company_details personal_details location profileImage",
    })
    .populate({
      path: "following", // The field to populate
      model: "User", // The model to use for populating
      select: "username company_details personal_details location profileImage",
    });

    console.log("followData", followDetails);

    // Return results
    res.json(followDetails);

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};

// Get users that a user is following
const handleGetFollowing = (Model) => async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);
    
    // Validate inputs
    if (!userId) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "User ID is required",
        });
    }

    // Fetch data
    const followDetails = await Model.find({
      user: userId
    })
    .populate({
      path: "user", // The field to populate
      model: "User", // The model to use for populating
      select: "username personal_details location profileImage",
    })
    .populate({
      path: "follower", // The field to populate
      model: "User", // The model to use for populating
      select: "username personal_details location profileImage",
    });

    console.log(followDetails);
    
    // Return results
    res.json(followDetails);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};

// Unfollow a user
const handleUnfollow = (Model) => async (req, res) => {
  try {
    const { userId, followingId } = req.params;
    
    // Validate inputs
    if (!userId || !followingId) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "User ID and Following ID are required",
        });
    }

    // Remove the follow relationship
    const result = await Model.findOneAndDelete({
      user: userId,
      following: followingId,
    });

    if (!result) {
      return res
        .status(404)
        .json({
          status: "error",
          message: "Follow relationship not found",
        });
    }

    res.json({ status: "success", message: "Unfollowed successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};

// CRUD operations for Follow
export const createFollow = asyncHandler(handleCreateFollow(Follow));
export const getFollowers = asyncHandler(handleGetFollowers(Follow));
export const getFollowing = asyncHandler(handleGetFollowing(Follow));
export const unfollow = asyncHandler(handleUnfollow(Follow));
