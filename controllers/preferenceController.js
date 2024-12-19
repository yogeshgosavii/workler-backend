import Preference from "../models/preferenceModel.js";
import mongoose from "mongoose";

// Create a new preference
export const createPreference = async (req, res) => {
    const { jobType, location, experienceLevel, industries } = req.body;
  
  
  
    try {
      const newPreference = new Preference({
        user: req.user._id,
        jobType,
        location,
        experienceLevel,
        industries,
      });
  
      const savedPreference = await newPreference.save();
      console.log("Saved Preference:", savedPreference);
      
      res.status(201).json(savedPreference);
    } catch (error) {
      console.error("Error creating preference:", error.message);
      res.status(500).json({ error: error.message });
    }
  };

// Get a preference by user ID
export const getPreference = async (req, res) => {
  const { userId } = req.params;

  try {
    const preference = await Preference.findOne({ user: userId });
    if (!preference) {
      return res.status(404).json({ error: "Preference not found" });
    }
    res.json(preference);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a preference by user ID
export const updatePreference = async (req, res) => {
  const { userId } = req.params;
  const { jobType, location, experienceLevel, industries ,roles } = req.body;

//   if (salary && salary.min >= salary.max) {
//     return res.status(400).json({ error: "Minimum salary should be less than maximum salary" });
//   }

console.log(location);


  try {
    const updatedPreference = await Preference.findOneAndUpdate(
      { user: userId },
      { jobType, location, experienceLevel, industries ,roles },
      { new: true, runValidators: true }
    );
    


    if (!updatedPreference) {
      return res.status(404).json({ error: "Preference not found" });
    }
    console.log(updatedPreference);
    
    res.json(updatedPreference);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a preference by user ID
export const deletePreference = async (req, res) => {
  const { userId } = req.params;

  try {
    const deletedPreference = await Preference.findOneAndDelete({ user: userId });
    if (!deletedPreference) {
      return res.status(404).json({ error: "Preference not found" });
    }
    res.json({ message: "Preference deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
