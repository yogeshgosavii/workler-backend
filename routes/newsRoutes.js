import express from "express";
import { fetchAndStoreNews, getNews } from "../controllers/newsController.js";

const router = express.Router();

// Route to manually fetch and update news (optional, for admin use)
router.post("/update", fetchAndStoreNews);

// Route to get news for the frontend
router.get("/", getNews);

export default router;
