import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {getlocationPlace} from "../controllers/locationController.js"

const router = express.Router();

router.route('/place')
  .get(protect, getlocationPlace);

  export default router;

