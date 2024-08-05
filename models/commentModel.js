import mongoose, { Schema } from "mongoose";

const commentSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
      },
    commentMessage : String
})

export default commentSchema