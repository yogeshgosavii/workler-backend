import mongoose from "mongoose";
import Location from './locationModel.js'


const preferenceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    jobType: { type: String, enum: ["Full time", "Part time", "Contract","Freelance", "Internship"], default: "Full time" },
    location:{type : Location},
    roles : {type:[String]},
    experienceLevel: { type: String, enum: ["Entry", "Mid", "Senior", "Lead"], default: "Entry" },
    industries: [{ type: String }], // Array to allow multiple industry preferences
  },
  {
    timestamps: true,
  }
);

const Preference = mongoose.model("Preference", preferenceSchema);
export default Preference;
