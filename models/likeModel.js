import mongoose from "mongoose";
import { Schema } from "mongoose";

const likeSchema =  new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
      },
    like_type : String
})

export default likeSchema