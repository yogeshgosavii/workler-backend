import { model, Schema } from "mongoose";

const approachSchema = new Schema({
    job:{
        type : Schema.Types.ObjectId,
        ref : "Job"
    },
    user : {
        type : Schema.Types.ObjectId,
        ref : "User",
    },
    employeer :{
        type: Schema.Types.ObjectId,
        ref : "User"
    },
    status : {
        type : String,
        default : "approached"
    }

},{timestamp : true});

const Approach = model("Approach", approachSchema);

export default Approach;
