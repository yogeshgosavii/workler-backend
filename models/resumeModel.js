import { Schema, model } from "mongoose";

const resumeSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    resumeFile: [String],
    fileName : String
  },
  {
    timestamps: true, 
  }
);

const Resumes = model("Resume", resumeSchema);

export default Resumes;
