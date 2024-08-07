import { Schema } from "mongoose";

const likeSchema = new Schema({
  post: {
    type: Schema.Types.ObjectId,
  },
  user: {
    type: Schema.Types.ObjectId,
  },

  like_type: {
    type: String,
    enum: ['thumbs_up', 'heart', 'star'],
    default : 'heart'
  },
}, { timestamps: true });

likeSchema.index({ post: 1, user: 1 }, { unique: true });

export default likeSchema;
