import asyncHandler from "express-async-handler";
import Comment from "../models/commentModel.js";
import Posts from "../models/postModel.js";
import notificationController from "./notificationController.js";
import { Notification } from "../models/notificationModule.js";
import mongoose from "mongoose";

// Add a normal comment to a post
const handleAddComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }

  console.log("bo",req.body);
  

  // Save the comment
  const comment = new Comment({
    user: userId,
    post: postId,
    content,
    mentions : req.body.mentions || [],
    parentComment: null, // This is a normal comment
  });

  await comment.save();

   await Promise.all(
        comment.mentions?.map(async (mention) => {
        console.log("com",mention,req.user._id)
        if (mention.toString() !== req.user._id.toString()){
          const notificationData = {
            userId: mention, // User receiving the notification (parent comment author)
            related_to: req.user._id, // The user who made the reply
            notificationType: "mention", // Notification type
            actionId: comment._id, // Example hardcoded ObjectId
            message: `${req.user.username} mentioned you in their comment`, // Custom message
            contentId: comment._id, 
          };
  
          // Create the notification using the notification controller
          const notificationResult = await notificationController.createNotification({
            body: notificationData,
          });
  
          if (!notificationResult.success) {
            console.error("Notification creation error:", notificationResult.error);
          }
         }
        })
      );

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

  // Validate commentId to ensure it's a valid ObjectId
  if (!commentId) {
    console.error("Invalid commentId:", commentId);
    return res.status(400).json({ message: "Invalid comment ID." });
  }

  // Check if the parent comment exists
  const parentComment = await Comment.findById(commentId).populate('user', 'username');
  if (!parentComment) {
    return res.status(404).json({ message: "Parent comment not found" });
  }

  console.log("parent",parentComment,req.body)

  // Create a reply comment linked to the parent comment
  let replyComment = new Comment({
    user: userId,
    post: parentComment.post,
    content,
    mentions : req.body.mentions,
    parentComment: parentComment._id,
  });

  await replyComment.save();

  await Promise.all(
    replyComment.mentions?.map(async (mention) => {
    console.log("com",mention,req.user._id)
    if (mention.toString() !== req.user._id.toString()){
      const notificationData = {
        userId: mention, // User receiving the notification (parent comment author)
        related_to: req.user._id, // The user who made the reply
        notificationType: "mention", // Notification type
        actionId: replyComment._id, // Example hardcoded ObjectId
        message: `${req.user.username} mentioned you in their comment`, // Custom message
        contentId: replyComment._id, 
      };

      // Create the notification using the notification controller
      const notificationResult = await notificationController.createNotification({
        body: notificationData,
      });

      if (!notificationResult.success) {
        console.error("Notification creation error:", notificationResult.error);
      }
     }
    })
  );
  



  console.log("Reply Comment ID:", replyComment._id); // Check if ID is generated correctly

  // Avoid sending a notification if the user replies to their own comment
if (parentComment.user._id.toString() !== userId) {
  const notificationData = {
    userId: parentComment.user._id,        // User receiving the notification (parent comment author)
    related_to: userId,                    // The user who made the reply
    notificationType: "reply",             // Notification type
    actionId: replyComment._id, // Example hardcoded ObjectId
    contentId: parentComment._id,          // Parent comment's ID
    message: `${req.user.username} replied to your comment`, // Custom message
  };

  // Create the notification using the notification controller
  const notificationResult = await notificationController.createNotification({ body: notificationData });
  
  if (!notificationResult.success) {
    console.error("Notification creation error:", notificationResult.error);
  }
}


  res.status(201).json(replyComment);
});




// Get all comments and replies for a post
const handleGetComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  // Fetch all normal comments (parentComment is null) and their replies
  const comments = await Comment.find({ post: postId })
  .populate("user", "username personal_details company_details location profileImage bio") // Populate the user of the comment
  .populate({
    path: "mentions", // The field to populate
    model: "User", // The model to use for populating
    select:
      "username personal_details company_details location profileImage bio",
  })
  .populate({
    path: "parentComment", // Specify the path for parentComment
    populate: { // Nested populate to get user of the parentComment
      path: "user", // Specify the user field in the parentComment
      select: "username personal_details company_details location profileImage bio" // Fields to retrieve from the user
    }
  });

   
  res.json(comments);
});

// Get replies for a specific comment
const handleGetReplies = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  // Find replies to the specific comment
  const replies = await Comment.find({ parentComment: commentId })
    .populate("user","username personal_details company_details location profileImage")
    .populate({
      path: "mentions", // The field to populate
      model: "User", // The model to use for populating
      select:
        "username personal_details company_details location profileImage",
    })

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
  });


  res.json({ message: "Comment and replies deleted successfully" });
});

// CRUD operations for Comment
export const addComment = asyncHandler(handleAddComment);
export const addReply = asyncHandler(handleAddReply);
export const getComments = asyncHandler(handleGetComments);
export const getReplies = asyncHandler(handleGetReplies);
export const deleteComment = asyncHandler(handleDeleteComment);
