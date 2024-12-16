import asyncHandler from "express-async-handler";
import Post from "../models/postModel.js";
import notificationController from "./notificationController.js";
import { Job } from "../models/jobModel.js";
import Follow from "../models/followModel.js";
import { Notification } from "../models/notificationModule.js";




// Create a new document
const handleCreate = (Model) => async (req, res) => {
  try {

    console.log("mentions",req.body)
    const data = new Model({
      ...req.body,
      images: req.images,
      user: req.user._id,
      mentions : req.body.mentions?.split(",") || []
    });
    await data.save();

    // Use Promise.all to ensure all asynchronous operations complete
    await Promise.all(
      data.mentions?.map(async (mention) => {
      console.log("com",mention,req.user._id)
      if (mention.toString() !== req.user._id.toString()){
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

const handleGetUserFollowingPosts = (PostModel,FollowingModel) => async (req, res) => {
  try {
    const currentUserId = req.user._id; // Assuming current user ID is set by authentication middleware

    // Fetch the current user's following list

    const followingList = await FollowingModel.find({ user: currentUserId });
    // Extract the following IDs from the list of objects
    const followingIds = followingList.map((item) => item.following);

    // Fetch posts from users the current user follows
    const posts = await PostModel.find({ user: { $in: [...followingIds, currentUserId] } })
      .populate({
        path: "jobs",
        model: "Job",
        select: "job_role company_name job_tags job_url",
      })
      .populate({
        path: "user",
        model: "User",
        select: "username personal_details company_details location profileImage",
      })
      .populate({
        path: "mentions",
        model: "User",
        select: "username personal_details company_details location profileImage",
      });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

//optimized 
// const handleGetUserFollowingPosts = (PostModel, FollowingModel) => async (req, res) => {
//   try {
//     const currentUserId = req.user._id; // Assuming current user ID is set by authentication middleware

//     // Fetch the current user's following list
//     const followingList = await FollowingModel.find({ user: currentUserId }).select("following");

//     // Extract the following IDs from the list of objects
//     const followingIds = followingList.map((item) => item.following);

//     if (followingIds.length === 0) {
//       return res.status(200).json([]); // Return an empty array if the user follows no one
//     }

//     // Pagination parameters
//     const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 posts per page
//     const page = parseInt(req.query.page, 10) || 1; // Default to the first page
//     const skip = (page - 1) * limit;

//     // Fetch posts from users the current user follows
//     const posts = await PostModel.find({ user: { $in: followingIds } })
//       .sort({ createdAt: -1 }) // Sort by newest posts
//       .skip(skip)
//       .limit(limit)
//       .select("user jobs mentions content createdAt") // Select only required fields
//       .populate({
//         path: "jobs",
//         model: "Job",
//         select: "job_role company_name job_tags job_url",
//       })
//       .populate({
//         path: "user",
//         model: "User",
//         select: "username personal_details company_details location profileImage",
//       })
//       .populate({
//         path: "mentions",
//         model: "User",
//         select: "username personal_details company_details location profileImage",
//       });

//     // Count total posts for pagination metadata
//     const totalPosts = await PostModel.countDocuments({ user: { $in: followingIds } });

//     res.status(200).json({
//       posts,
//       metadata: {
//         totalPosts,
//         currentPage: page,
//         totalPages: Math.ceil(totalPosts / limit),
//         limit,
//       },
//     });
//   } catch (error) {
//     console.error("Error:", error.message);
//     res.status(500).json({ error: "Server Error", details: error.message });
//   }
// };





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

    // Find and delete the main document
    const data = await Model.findByIdAndDelete(id);

    if (!data) {
      return res.status(404).json({ message: "Not found" });
    }

    // Delete notifications related to this document
    await Notification.deleteMany({ actionId: id });

    // Delete associated jobs
    if (data.jobs && data.jobs.length > 0) {
      await Promise.all(
        data.jobs.map((jobId) => Job.findByIdAndDelete(jobId))
      );
    }

    return res.status(200).json({ message: "Deletion successful" });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// CRUD operations for Post
export const addPost = asyncHandler(handleCreate(Post));
export const addJobPost = asyncHandler(handleCreateJobPost(Post));
export const getUserPosts = asyncHandler(handleUserGetAll(Post));
export const getPosts = asyncHandler(handleGetAll(Post));
export const getUserFollowingPosts = asyncHandler(handleGetUserFollowingPosts(Post,Follow));
export const getPostById = asyncHandler(handleGetById(Post)); // New export
export const updatePost = asyncHandler(handleUpdate(Post));
export const deletePost = asyncHandler(handleDelete(Post));
export const getPostByUserId = asyncHandler(handleGetPostByUserId(Post));

