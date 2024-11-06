import asyncHandler from "express-async-handler";

import Interview from "../models/interviewModel.js";
import { Job } from "../models/jobModel.js";
import notificationController from "./notificationController.js";

// Create a new document
const generateJitsiMeetingLink = () => {
  const roomName = `meeting-${Math.random().toString(36).substr(2, 9)}`;
  const meetLink = `https://meet.jit.si/${roomName}`;
  console.log("meetlink:", meetLink);

  return meetLink;
};

// Create a new interview document
const handleCreateInterview = (Model) => async (req, res) => {
  try {
    // Destructure interview_mode and interview_meet_link from request body
    const { interview_mode, interview_meet_link } = req.body;
    const userId = req.user.id;

    // Initialize the data object with the request body
    const data = new Model({
      ...req.body,
      interview_meet_link:
        interview_mode == "Online" && !interview_meet_link
          ? generateJitsiMeetingLink()
          : interview_meet_link,
    });

    console.log(data);

  

    // Avoid sending a notification if the user comments on their own post
    // if (userId) {
    //   // Create a notification for the post author
    //   const notificationData = {
    //     userId: data.employeer, // Post author's ID
    //     related_to: data.user, // Commenter’s user ID
    //     notificationType: "interview", // Notification type
    //     message: `${req.user.username} inerview setup`, // Notification message
    //     contentId: data._id, // Link to the post
    //   };

    //   // Call createNotification and handle the response
    //   const notificationResult =
    //     await notificationController.createNotification({
    //       body: notificationData,
    //     });

    //   if (!notificationResult.success) {
    //     // Log the error or send a warning response if needed
    //     console.error(notificationResult.error);
    //   }

    //   await data.save();
    //   res.status(201).json(data);
    // }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
};

// const handleCheckApplied = (Model) => async (req, res) => {
//     try {
//       const { userId, jobId } = req.body;

//       console.log(userId,jobId);

//       // Validate inputs
//       if (!userId || !jobId) {
//         return res
//           .status(400)
//           .json({
//             status: "error",
//             message: "User ID and Job ID are required",
//           });
//       }

//       // Fetch data
//       const data = await Model.find({
//         user: userId,
//         job: jobId,
//       });

//       console.log("applied", data);

//       // Return results
//       if(data.length>0){
//         res.json({exists : true})
//       }
//       else{
//         res.json({exists : false})

//       }
//     } catch (error) {
//       console.error("Error:", error);
//       res.status(500).json({ status: "error", message: "Server Error" });
//     }
//   };

const handleGetEmployeerInterviews = (Model) => async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);

    // Validate inputs
    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID are required",
      });
    }

    // Fetch data
    const interviewDetails = await Model.find({
      employeer: userId,
    })
      .populate({
        path: "job", // The field to populate
        model: "Job", // The model to use for populating
      })
      .populate({
        path: "user", // The field to populate
        model: "User", // The model to use for populating
        select: "username personal_details location profileImage",
      });

    console.log(interviewDetails);

    // Return results
    res.json(interviewDetails);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};

const handleGetUserInterviews = (Model) => async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);

    // Validate inputs
    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID are required",
      });
    }

    // Fetch data
    const interviewDetails = await Model.find({
      user: userId,
    })
      .populate({
        path: "job", // The field to populate
        model: "Job", // The model to use for populating
      })
      .populate({
        path: "user", // The field to populate
        model: "User", // The model to use for populating
        select: "username personal_details location profileImage",
      });

    console.log(interviewDetails);

    // Return results
    res.json(interviewDetails);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};

// CRUD operations for Post
export const createInterview = asyncHandler(handleCreateInterview(Interview));
export const getUserInterviews = asyncHandler(
  handleGetUserInterviews(Interview)
);
export const getEmployeerInterviews = asyncHandler(
  handleGetEmployeerInterviews(Interview)
);
