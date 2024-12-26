import { Schema as _Schema, model } from "mongoose";

const Schema = _Schema;

const reportSchema = new Schema({
  reportType: {
    type: String,
    enum: ["comment", "post"],
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  reportedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reportedUser: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reportedContent: {
    type: [Schema.Types.ObjectId],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Report = model("Report", reportSchema);

export default Report;
