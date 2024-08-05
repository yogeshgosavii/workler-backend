import express from 'express';
import { imageMiddleware } from '../middleware/imageMiddleware.js';
import {
addPost,deletePost,getPosts,
  getUserPosts,
updatePost} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import customUpload from '../middleware/uploadMiddleware.js';

const router = express.Router();

const upload = customUpload(5)

// Routes for Skills
router.route('/post')
  .post(protect,upload,imageMiddleware, addPost)
  .get(protect,getUserPosts);

router.route("all-posts")
  .get(protect,getPosts)

  router.route('/post/:id')
  .put(protect, updatePost)
  .delete(protect, deletePost);


export default router;
