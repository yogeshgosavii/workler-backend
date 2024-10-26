import { Job } from "../models/jobModel.js";
import Saved from "../models/savedModel.js";
import User from "../models/userModel.js";

// Create a saved content
export async function createSaved(req, res) {
  try {
    const data = new Saved({ ...req.body });
    await data.save();
    res.status(201).json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
}

// Check if a specific content is saved by the user
export async function checkSaved(req, res) {
  try {
    const { saved_content } = req.body; // Assuming saved_content is sent in the request body

    const savedItem = await Saved.findOne({
      user: req.user._id,
      // saved_content,
    });

    res.status(200).json({ exists: !!savedItem });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
}

// Unsave a specific content by its ID
export async function unsaveContent(req, res) {
  try {
    const { id } = req.params; // Assuming the saved content ID is passed as a URL parameter
    const deletedItem = await Saved.findOneAndDelete({
      saved_content: id,
      user: req.user._id,
    });

    if (!deletedItem) {
      console.log("Saved content not found or unauthorized");

      return res
        .status(404)
        .json({ message: "Saved content not found or unauthorized" });
    }

    res.status(200).json({ message: "Content unsaved successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
}

// Get specific saved content by type (e.g., posts, profiles, jobs)
export async function getSpecificSaved(req, res) {
  try {
    const { contentType } = req.params; // e.g., 'posts', 'profiles', or 'jobs'

    // Set the model and select fields based on contentType

    // Find saved items and populate based on the contentType
    const savedItems = await Saved.find({
      user: req.user._id,
      contentType,
    }).populate({
      path: "saved_content", // Field to populate
      strictPopulate: false, // Allows to populate even if the path is not in schema

      model:
        contentType === "post"
          ? "Posts"
          : contentType === "job"
          ? "Job"
          : "User", // Dynamically set model
      populate: {
        // Nested population
        path: "job", // Field in the Job model that references another document (example: company)
        model: "Job", // Model to populate in the nested field (example: Company)
        strictPopulate: false, // Allows to populate even if the path is not in schema

      },
      populate: {
        // Nested population
        path: "user", // Field in the Job model that references another document (example: company)
        model: "User", // Model to populate in the nested field (example: Company)
        select: "username personal_details company_details location profileImage",

        strictPopulate: false, // Allows to populate even if the path is not in schema

      },
    });

    if (!savedItems.length) {
      return res
        .status(404)
        .json({ message: `No saved ${contentType} found for this user.` });
    }

    res.status(200).json(savedItems);
  } catch (error) {
    console.error("Error retrieving saved items:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching saved items" });
  }
}

// Get all saved content of a specific type (jobs, profiles, posts)
export async function getSavedByType(req, res) {
  try {
    const { type } = req.params; // For example, 'jobs', 'profiles', 'posts'
    const savedItems = await Saved.find({ user: req.user._id, type });

    if (savedItems.length === 0) {
      return res.status(404).json({ message: `No saved ${type} found` });
    }

    res.status(200).json(savedItems);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
}
