import { model, Schema } from "mongoose";

const interviewSchema = new Schema({
    job: {
        type: Schema.Types.ObjectId,
        ref: "Job",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    employeer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    interview_date: {
        type: Date,
        required: true
    },
    interview_time: {
        type: String, // Store time as a string in the format "HH:MM"
        required: true
    },
    interview_mode: {
        type: String,
        enum: ["In-person", "Online", "Phone call"],
        required: true
    },
    interview_address: {
        type: String,
    },
    interview_location_link: {
        type: String
    },
    interview_meet_link: {
        type: String
    }
});

const Interview = model("Interview", interviewSchema);

export default Interview;
