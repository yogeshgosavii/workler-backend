import { Schema, model } from "mongoose";
import imageSchema from "./imageModel.js";
import commentSchema from "./commentModel.js";
import { jobSchema } from "./jobModel.js";

const postSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    likes_count: {
      type: Number,
      default: 0,
    },
    comments_count: {
      type: Number,
      default: 0,
    },
    jobs: [{ type: Schema.Types.ObjectId, ref: "Job" }],
    images: imageSchema,
    content: String,
    post_type: String,
    mentions :[{ type: Schema.Types.ObjectId, ref: "User" }]
  },
  {
    timestamps: true, 
    versionKey: false, 
  }
);

const Posts = model("Posts", postSchema);

export default Posts;
