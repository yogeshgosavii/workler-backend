import asyncHandler from "express-async-handler";
import { Like } from "../models/likeModel.js";
import { Notification } from "../models/notificationModule.js"; // Assuming you have a Notification model
import notificationController from "../controllers/notificationController.js"; // Assuming createNotification is defined here
import Posts from "../models/postModel.js";

// Add a like to a post and create a notification
const handleLikePost = (Model) => async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id; // Assume user is authenticated and `req.user.id` exists

    // Check if the user already liked the post
    const existingLike = await Model.findOne({ user: userId, post: postId });
    if (existingLike) {
      return res.status(400).json({ message: "You already liked this post" });
    }

    // Create a new like
    const like = new Model({ user: userId, post: postId });
    await like.save();
    const post = await Posts.findById(postId).populate('user', 'username');
    const postAuthorId = post.user._id;

    console.log(postAuthorId,userId);
    
    // Create a notification for the post owner
    if (!postAuthorId.equals(userId)) {
      // Create a notification for the post author
      const notificationData = {
        userId: postAuthorId,  // Post author's ID
        related_to: userId,    // Commenter’s user ID
        notificationType: "like",  // Notification type
        message: `${req.user.username} liked your post`,  // Notification message
        contentId: postId,  // Link to the post
      };
  
      // Call createNotification and handle the response
      const notificationResult = await notificationController.createNotification({ body: notificationData });
  
      if (!notificationResult.success) {
        // Log the error or send a warning response if needed
        console.error(notificationResult.error);
      }
    }

    res.status(201).json(like);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
};

// Remove a like from a post and delete the related notification
const handleUnlikePost = (Model) => async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    // Check if the like exists
    const like = await Model.findOne({ user: userId, post
      : postId });
    console.log(like)
    if (!like) {
      return res.status(404).json({ message: "Like not found" });
    }

    // Remove the like
    await like.deleteOne();

    // Remove the notification related to this like
    await Notification.findOneAndDelete({
      related_to: userId,
      notificationType: "like",
      contentId: postId,
    });

    res.json({ message: "Like removed and notification deleted successfully" });
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
      select: "username company_details  personal_details location profileImage",
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
