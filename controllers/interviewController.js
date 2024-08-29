import asyncHandler from "express-async-handler";

import Interview from "../models/interviewModel.js";

// Create a new document
const handleCreateInterview = (Model) => async (req, res) => {
  try {
    const data = new Model({
      ...req.body,
    });

    console.log(data);
    
    await data.save();
    res.status(201).json(data);
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
      if (!userId ) {
        return res
          .status(400)
          .json({
            status: "error",
            message: "User ID are required",
          });
      }
  
      // Fetch data
      const interviewDetails = await Model.find({
        employeer : userId
      }) .populate({
          path: "job", // The field to populate
          model: "Job", // The model to use for populating
        })
        .populate({
          path: "user", // The field to populate
          model: "User", // The model to use for populating
          select: "username personal_details location profileImage",
        })
  
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
    if (!userId ) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "User ID are required",
        });
    }

    // Fetch data
    const interviewDetails = await Model.find({
      user : userId
    }).populate({
        path: "job", // The field to populate
        model: "Job", // The model to use for populating
      })
      .populate({
        path: "user", // The field to populate
        model: "User", // The model to use for populating
        select: "username personal_details location profileImage",
      })

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
export const getUserInterviews = asyncHandler(handleGetUserInterviews(Interview));
export const getEmployeerInterviews = asyncHandler(handleGetEmployeerInterviews(Interview));

