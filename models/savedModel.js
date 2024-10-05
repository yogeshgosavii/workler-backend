import mongoose from "mongoose";

const savedSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  saved_content: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "contentType", // Dynamically sets the reference model based on contentType
  },
  contentType: { type: String, enum: ['post', 'job', 'profile'] },
  createdAt: { type: Date, default: Date.now },
});

const Saved = mongoose.model("Saved", savedSchema);
export default Saved;
