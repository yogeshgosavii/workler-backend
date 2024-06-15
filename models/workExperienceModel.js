
const mongoose = require('mongoose');

const workExperienceSchema = new mongoose.Schema({
  currentWorking:String,
  type:String,
  companyName:String,
  jobTitle:String,
  annualSalary : Number,
  joiningDate : Date,
  leavingDate : Date,
  noticePeriod : String,
  years:Number,
  months:Number,
  location:String,
  department:String,
  employmentType:String,
  stipend:Number


});

const WorkExperience = mongoose.model('WorkExperience', workExperienceSchema);

module.exports = WorkExperience;
