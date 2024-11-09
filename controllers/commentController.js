import asyncHandler from "express-async-handler";
import Comment from "../models/commentModel.js";
import Posts from "../models/postModel.js";
import notificationController from "./notificationController.js";
import { Notification } from "../models/notificationModule.js";

// Add a normal comment to a post
const handleAddComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }

  // Save the comment
  const comment = new Comment({
    user: userId,
    post: postId,
    content,
    parentComment: null, // This is a normal comment
  });

  await comment.save();

  // Fetch post details to find the post author
  const post = await Posts.findById(postId).populate('user', 'username');
  const postAuthorId = post.user._id;

  // Avoid sending a notification if the user comments on their own post
  if (!postAuthorId.equals(userId)) {
    // Create a notification for the post author
    const notificationData = {
      userId: postAuthorId,  // Post author's ID
      related_to: userId,    // Commenter’s user ID
      notificationType: "comment",  // Notification type
      actionId:comment._id,
      message: `${req.user.username} commented on your post`,  // Notification message
      contentId: postId,  // Link to the post
    };

    // Call createNotification and handle the response
    const notificationResult = await notificationController.createNotification({ body: notificationData });

    if (!notificationResult.success) {
      // Log the error or send a warning response if needed
      console.error(notificationResult.error);
    }
  }

  // Send the response only once after everything is done
  res.status(201).json(comment);
});





// Add a reply to a comment
const handleAddReply = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!content) {
    return res.status(400).json({ message: "Reply content is required" });
  }

  // Check if the parent comment exists
  const parentComment = await Comment.findById(commentId).populate('user', 'username'); // Populate the user who made the parent comment
  if (!parentComment) {
    return res.status(404).json({ message: "Parent comment not found" });
  }

  // Create a reply comment linked to the parent comment
  const replyComment = new Comment({
    user: userId,
    post: parentComment.post, // Inherit the post from the parent comment
    content,
    parentComment: parentComment._id, // This is a reply to the parent comment
  });

  await replyComment.save();

  // Avoid sending a notification if the user replies to their own comment
  if (parentComment.user._id.toString() !== userId) {
    // Create a notification for the parent comment author
    const notificationData = {
      userId: parentComment.user._id,  // Send notification to the parent comment author
      related_to: userId,              // The user who made the reply
      notificationType: "reply",  
      actionId:replyComment._id,
      contentId: parentComment._id,    // Notification type
      message: `${req.user.username} replied to your comment`, // Customize the message
    };

    // Call createNotification and handle the response
    const notificationResult = await notificationController.createNotification({ body: notificationData });

    if (!notificationResult.success) {
      console.error(notificationResult.error);  // Log the error
      // You can send a response or handle the error as needed
    }
  }

  // Send the response for the reply creation
  res.status(201).json(replyComment);
});


// Get all comments and replies for a post
const handleGetComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  // Fetch all normal comments (parentComment is null) and their replies
  const comments = await Comment.find({ post: postId })
  .populate("user", "username profileImage") // Populate the user of the comment
  .populate({
    path: "parentComment", // Specify the path for parentComment
    populate: { // Nested populate to get user of the parentComment
      path: "user", // Specify the user field in the parentComment
      select: "username profileImage" // Fields to retrieve from the user
    }
  });

   
  res.json(comments);
});

// Get replies for a specific comment
const handleGetReplies = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  // Find replies to the specific comment
  const replies = await Comment.find({ parentComment: commentId })
    .populate("user", "username profileImage");

  res.json(replies);
});

// Delete a comment and its replies
const handleDeleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  // Find the comment to delete
  const comment = await Comment.findById(commentId);
  if (!comment) {
    return res.status(404).json({ message: "Comment not found" });
  }

  // Check if the user is the owner of the comment
  if (comment.user.toString() !== userId) {
    return res.status(401).json({ message: "Not authorized to delete this comment" });
  }

  // Delete the comment and any replies to it
  await Comment.deleteMany({
    $or: [{ _id: commentId }, { parentComment: commentId }],
  });

  await Notification.findOneAndDelete({
    actionId:commentId,
    notificationType: "comment",
  });


  res.json({ message: "Comment and replies deleted successfully" });
});

// CRUD operations for Comment
export const addComment = asyncHandler(handleAddComment);
export const addReply = asyncHandler(handleAddReply);
export const getComments = asyncHandler(handleGetComments);
export const getReplies = asyncHandler(handleGetReplies);
export const deleteComment = asyncHandler(handleDeleteComment);
