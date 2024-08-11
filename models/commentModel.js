import mongoose, { Schema } from "mongoose";

const commentSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
      },
    comment_text : String
}, { timestamps: true })


export default commentSchema