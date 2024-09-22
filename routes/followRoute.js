import { Router } from 'express';
const router = Router();

import { protect } from '../middleware/authMiddleware.js';
import { createFollow, getFollowers, getFollowing, unfollow } from '../controllers/followController.js';


router.post('/create-follow',protect, createFollow);
router.get('/get-followers/:userId',protect, getFollowers);
router.get('/get-following/:userId',protect, getFollowing);
router.delete('/unfollow/:userId/:followingId',protect, unfollow);



export default router;
