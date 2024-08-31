import { model, Schema } from "mongoose";

const applicationSchema = new Schema({
    job:{
        type : Schema.Types.ObjectId,
        ref : "Job"
    },
    user : {
        type : Schema.Types.ObjectId,
        ref : "User",
    },

    employeer : {
        type : Schema.Types.ObjectId,
        ref : "User",
    },
  
    status : {
        type : String,
        default : "sent"
    }

},{timestamps:true});

const Application = model("Application", applicationSchema);

export default Application;
