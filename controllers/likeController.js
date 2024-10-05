import asyncHandler from "express-async-handler";
import {Like} from "../models/likeModel.js";

// Add a like to a post
const handleLikePost = (Model) => async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id; // Assume user is authenticated and `req.user.id` exists

    // Check if the user already liked the post
    const existingLike = await Model.findOne({ user: userId, post: postId });
    if (existingLike) {
      return res.status(400).json({ message: "You already liked this post" });
    }

    // Create a new like
    const like = new Model({ user: userId, post: postId });
    await like.save();
    res.status(201).json(like);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
};

// Remove a like from a post
const handleUnlikePost = (Model) => async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Check if the like exists
    const like = await Model.findOne({ user: userId, post: postId });
    if (!like) {
      return res.status(404).json({ message: "Like not found" });
    }

    // Remove the like
    await like.deleteOne();
    res.json({ message: "Like removed successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
};

// Get all users who liked a post
const handleGetPostLikes = (Model) => async (req, res) => {
  try {
    const { postId } = req.params;

    // Fetch all users who liked the post
    const likes = await Model.find({ post: postId }).populate({
      path: "user",
      select: "username profileImage", // Adjust based on your user fields
    });

    res.json(likes);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
};

export const likePost = asyncHandler(handleLikePost(Like));
export const unlikePost = asyncHandler(handleUnlikePost(Like));
export const getPostLikes = asyncHandler(handleGetPostLikes(Like));
