import asyncHandler from "express-async-handler";
import Follow from "../models/followModel.js";
import notificationController from "../controllers/notificationController.js"; // Ensure you have the correct path
import User from "../models/userModel.js";
import { Notification } from "../models/notificationModule.js";


// Create a new document and send notification
const handleCreateFollow = (Model) => async (req, res) => {
  try {
    const data = new Model({
      ...req.body,
    });

    console.log(data);
    
    // Save the follow relationship
    const follow = await data.save();

    // Create a notification for the user being followed
    const followedUserId = follow.following; // ID of the followed user
    const followerUserId = follow.user; // ID of the follower

    // Fetch follower's details (assuming you have a User model)
    const followerDetails = await User.findById(followerUserId, {
      username: 1,
      profileImage: 1,
      // Add other fields you want to include
    });

    if (!followerDetails) {
      return res.status(404).json({ message: "Follower not found" });
    }

    // Construct the notification data
    const notificationData = {
      userId: followedUserId,  // Send notification to the followed user
      related_to: followerUserId,  // Related user (follower)
      notificationType: "follow",  // Notification type
      message: `${followerDetails.username} started following you`, // Customize your notification message
      profileImage: followerDetails.profileImage // Optional: include profile image
    };

    // Call the createNotification function directly
    await notificationController.createNotification({ body: notificationData }, res);

    // Send the response for the follow creation
    res.status(201).json(follow);
  } catch (error) {
    console.error("Error:", error);
    if (!res.headersSent) {
      res.status(500).send("Server Error");
    }
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
      select: "username company_details  personal_details location profileImage",
    })
    .populate({
      path: "following", // The field to populate
      model: "User", // The model to use for populating
      select: "username company_details personal_details location profileImage",
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

    await Notification.findOneAndDelete({
      userId: followingId,  // Send notification to the followed user
      related_to: userId,  // Related user (follower)
      notificationType: "follow", 
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
