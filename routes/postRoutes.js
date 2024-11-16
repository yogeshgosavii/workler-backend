import express from "express";
import { imageMiddleware } from "../middleware/docMiddleware.js";
import {
  addPost,
  addJobPost,
  deletePost,
  getPosts,
  getUserPosts,
  updatePost,
  getPostByUserId,
  getPostById,
  getUserFollowingPosts,
} from "../controllers/postController.js";
import {
  likePost,
  unlikePost,
  getPostLikes,
} from "../controllers/likeController.js"; // Import your like controller
import {
  addComment,
  addReply,
  getComments,
  getReplies,
  deleteComment,
} from "../controllers/commentController.js"; // Import your comment controller
import { protect } from "../middleware/authMiddleware.js";
import customUpload from "../middleware/uploadMiddleware.js";

const router = express.Router();
const upload = customUpload(5);

// Routes for Posts
router
  .route("/post")
  .post(protect, upload, imageMiddleware, addPost)
  .get(protect, getUserPosts);

router.route("/post/job-post").post(protect, addJobPost);

router.route("/all-posts").get(getPosts);

router.route("/post/following").get(protect,getUserFollowingPosts); 


router.route("/get-postby-userId/:userId").get(getPostByUserId);

router
  .route("/post/:id")
  .get(getPostById)
  .put(protect, updatePost)
  .delete(protect, deletePost);

// Like routes
router
  .route("/post/:postId/like")
  .put(protect, likePost) // Like a post
  .delete(protect, unlikePost); // Unlike a post

router.route("/post/:postId/likes").get(getPostLikes); // Get all likes for a post

// Comment routes
router.route("/post/:postId/comment").post(protect, addComment); // Add a comment

router.route("/post/comment/:commentId/reply").post(protect, addReply); // Add a reply to a comment

router.route("/post/comment/:commentId/reply").get(protect, getReplies); // Add a reply to a comment


router.route("/post/:postId/comments").get(getComments); // Get all comments for a post

router.route("/post/comment/:commentId").delete(protect, deleteComment); // Delete a comment



export default router;
