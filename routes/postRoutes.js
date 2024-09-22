import express from 'express';
import { imageMiddleware } from '../middleware/docMiddleware.js';
import {
addPost,addJobPost,deletePost,getPosts,
  getUserPosts,
updatePost,
getPostByUserId,
getPostById} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import customUpload from '../middleware/uploadMiddleware.js';

const router = express.Router();

const upload = customUpload(5)

// Routes for Skills
router.route('/post')
  .post(protect,upload,imageMiddleware, addPost)
  .get(protect,getUserPosts);

  router.route('/post/job-post')
  .post(protect,addJobPost)

  router.route("/all-posts")
  .get(getPosts)

  router.route("/get-postby-userId/:userId")
  .get(getPostByUserId)

  router.route('/post/:id')
  .get( getPostById)
  .put(protect, updatePost)
  .delete(protect, deletePost);

  router.route('/post/:id/like')
  .put(protect,updatePost)

  router.route('/post/:id/comment')
  .put(protect,updatePost)



export default router;
