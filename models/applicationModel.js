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

    resume : {
        type : Schema.Types.ObjectId,
        ref : "Resume",
    },

    employeer : {
        type : Schema.Types.ObjectId,
        ref : "User",
    },
  
    status : {
        type : String,
        default : "sent"
    },
    deletedBy: { type: [Schema.Types.ObjectId], ref: 'User', default: [] }, // Array of user IDs who deleted the application


},{timestamps:true});

const Application = model("Application", applicationSchema);

export default Application;
