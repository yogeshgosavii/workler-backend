
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  project_name: String,
  project_description: String,
  start_date:Date,
  end_date:Date,
  url : String
 });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
