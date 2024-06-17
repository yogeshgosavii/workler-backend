
import { Schema, model } from 'mongoose';

const projectSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  project_name: String,
  project_description: String,
  start_date:Date,
  end_date:Date,
  url : String
 });

const Project = model('Project', projectSchema);

export default Project;
