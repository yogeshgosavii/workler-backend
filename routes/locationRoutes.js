import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {getLocationPlace} from "../controllers/locationController.js"

const router = express.Router();

router.route('/place')
  .get(protect, getLocationPlace);

  export default router;

