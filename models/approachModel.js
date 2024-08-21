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
    }

});

const Approach = model("Approach", approachSchema);

export default Approach;
