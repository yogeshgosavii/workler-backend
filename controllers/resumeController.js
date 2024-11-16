import Resumes from "../models/resumeModel.js"; // Assuming the file is named Resume.js

export const addResume = async (req, res) => {
  try {
    // The uploaded file information is in req.file
    if (!req.filesUrls) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    console.log("finalFile",req.filesUrls);
    
    const resume = new Resumes({
      user: req.user._id,  // Assuming req.user contains authenticated user
      resumeFile: req.filesUrls[0].fileUrl,
      fileName: req.filesUrls[0].filename,
    });

    await resume.save();

    res.status(201).json({ message: "Resume uploaded successfully", resume });
  } catch (error) {
    console.log("error",error);
    
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUserResumes = async (req, res) => {
  try {
    const userId = req.user._id;  // Extract user ID from req.user

    // Fetch resumes associated with the user
    const resumes = await Resumes.find({ user: userId });

    // Log and send the fetched resumes
    console.log("resumes", resumes);
    res.json(resumes);

  } catch (error) {
    console.log("error", error);

    // Send server error response
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const deleteResumeById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch resumes associated with the user
    const resumes = await Resumes.findByIdAndDelete(id);

    // Log and send the fetched resumes
    console.log("resumes", resumes);
    return res.status(200).json({ message: "Deletion successful" });

  } catch (error) {
    console.log("error", error);

    // Send server error response
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

