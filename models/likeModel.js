import { Schema } from "mongoose";

const likeSchema = new Schema({
  post: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Post'
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  like_type: {
    type: String,
    enum: ['thumbs_up', 'heart', 'star'],
    default: 'heart'
  },
}, { timestamps: true });

likeSchema.index({ post: 1, user: 1 }, { unique: true, sparse: true });

export default likeSchema;
