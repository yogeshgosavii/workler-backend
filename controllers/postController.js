import asyncHandler from "express-async-handler";
import Post from "../models/postModel.js";
import notificationController from "./notificationController.js";

// Create a new document
const handleCreate = (Model) => async (req, res) => {
  console.log("imagesFinal", req.images);
  try {
    const data = new Model({
      ...req.body,
      images: req.images,
      user: req.user._id,
    });
    await data.save();

    // Use Promise.all to ensure all asynchronous operations complete
    await Promise.all(
      data.mentions?.map(async (mention) => {
        const notificationData = {
          userId: mention, // User receiving the notification (parent comment author)
          related_to: req.user._id, // The user who made the reply
          notificationType: "mention", // Notification type
          actionId: data._id, // Example hardcoded ObjectId
          message: `${req.user.username} mentioned you in their post`, // Custom message
          contentId: data._id, 
        };

        // Create the notification using the notification controller
        const notificationResult = await notificationController.createNotification({
          body: notificationData,
        });

        if (!notificationResult.success) {
          console.error("Notification creation error:", notificationResult.error);
        }
      })
    );

    res.status(201).json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
};


const handleCreateJobPost = (Model) => async (req, res) => {
  try {
    const data = new Model({ ...req.body, user: req.user._id });
    await data.save();
    res.status(201).json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
};

// Get all documents for a specific user
const handleUserGetAll = (Model) => async (req, res) => {
  try {
    const data = await Model.find({ user: req.user?._id })
      .populate({
        path: "jobs", // The field to populate
        model: "Job", // The model to use for populating
        // Optional: Specify fields to include in the populated documents
        select: "job_role company_name job_tags job_url",
      })
      .populate({
        path: "user", // The field to populate
        model: "User", // The model to use for populating
        select:
          "username personal_details company_details location profileImage",
      })
      .populate({
        path: "mentions", // The field to populate
        model: "User", // The model to use for populating
        select:
          "username personal_details company_details location profileImage",
      });

    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
};

const handleGetPostByUserId = (Model) => async (req, res) => {
  const { userId } = req.params;
  try {
    const data = await Model.find({ user: userId })
      .populate({
        path: "jobs", // The field to populate
        model: "Job", // The model to use for populating
        // Optional: Specify fields to include in the populated documents
        select: "job_role company_name job_tags job_url",
      })
      .populate({
        path: "user", // The field to populate
        model: "User", // The model to use for populating
        select:
          "username personal_details company_details location profileImage",
      })
      .populate({
        path: "mentions", // The field to populate
        model: "User", // The model to use for populating
        select:
          "username personal_details company_details location profileImage",
      });

    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
};

// Get all documents (e.g., public posts)
const handleGetAll = (Model) => async (req, res) => {
  try {
    const data = await Model.find()
      .populate({
        path: "jobs", // The field to populate
        model: "Job", // The model to use for populating
        // Optional: Specify fields to include in the populated documents
        select: "job_role company_name job_tags job_url",
      })
      .populate({
        path: "user", // The field to populate
        model: "User", // The model to use for populating
        select:
          "username personal_details company_details location profileImage",
      })
      .populate({
        path: "mentions", // The field to populate
        model: "User", // The model to use for populating
        select:
          "username personal_details company_details location profileImage",
      });
    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
};

// Get a single document by ID
const handleGetById = (Model) => async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Model.findById(id)
      .populate({
        path: "jobs", // The field to populate
        model: "Job", // The model to use for populating
        // Optional: Specify fields to include in the populated documents
        select: "job_role company_name job_tags job_url",
      })
      .populate({
        path: "user", // The field to populate
        model: "User", // The model to use for populating
        select:
          "username personal_details company_details  location profileImage",
      })
      .populate({
        path: "mentions", // The field to populate
        model: "User", // The model to use for populating
        select:
          "username personal_details company_details location profileImage",
      });

    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
};

// Update a document by ID
const handleUpdate = (Model) => async (req, res) => {
  const {
    user,
    likes_count,
    likes,
    comments_count,
    comments,
    images,
    content,
    post_type,
    mentions,
  } = req.body;
  try {
    const { id } = req.params;
    const data = await Model.findById(id);

    // if (!data || data.user.toString() !== req.user?._id.toString()) {
    //   return res.status(401).json({ message: 'Not authorized' });
    // }
    Object.assign(data, req.body);

    data.likes = likes == [] ? null : likes;
    data.comments = comments == [] ? null : comments;
    data.mentions = mentions;
    const updatedData = await data.save();
    res.json(updatedData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
};

// Delete a document by ID
const handleDelete = (Model) => async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Model.findByIdAndDelete(id);

    if (!data) {
      return res.status(404).json({ message: "Not found" });
    }

    await Notification.deleteMany({ actionId: id });


    return res.status(200).json({ message: "Deletion successful" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// CRUD operations for Post
export const addPost = asyncHandler(handleCreate(Post));
export const addJobPost = asyncHandler(handleCreateJobPost(Post));
export const getUserPosts = asyncHandler(handleUserGetAll(Post));
export const getPosts = asyncHandler(handleGetAll(Post));
export const getPostById = asyncHandler(handleGetById(Post)); // New export
export const updatePost = asyncHandler(handleUpdate(Post));
export const deletePost = asyncHandler(handleDelete(Post));
export const getPostByUserId = asyncHandler(handleGetPostByUserId(Post));
