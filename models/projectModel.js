
import { Schema, model } from 'mongoose';
import imageSchema from './imageModel.js';

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
  logo : { type: imageSchema , default: null},
  technologies : { type: [String]} ,
  url : String
 });

const Project = model('Project', projectSchema);

export default Project;
