import { model, Schema } from "mongoose";

const followSchema = new Schema({
    user : {
        type : Schema.Types.ObjectId,
        ref : "User",
    },
    following :{
        type: Schema.Types.ObjectId,
        ref : "User"
    },

},{timestamp : true});

const Follow = model("Follow", followSchema);

export default Follow;
