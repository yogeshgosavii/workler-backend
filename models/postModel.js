import { Schema, model } from "mongoose";
import imageSchema from "./imageModel.js";
import likeSchema from "./likeModel.js";
import commentSchema from "./commentModel.js";

const postSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  likesCount: Number,
  likes: [likeSchema],
  commentsCount: Number,
  comments :[commentSchema],
  images : imageSchema,
  timestamp : Date,
  content : String,
  post_type : String

});

const Posts = model("Posts", postSchema);

export default Posts;
