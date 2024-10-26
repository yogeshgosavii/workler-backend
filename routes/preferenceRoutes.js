import express from "express";
import { createPreference, getPreference, updatePreference, deletePreference } from "../controllers/preferenceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/",protect, createPreference);
router.get("/:userId",protect, getPreference);
router.put("/:userId",protect, updatePreference);
router.delete("/:userId",protect, deletePreference);

export default router;
