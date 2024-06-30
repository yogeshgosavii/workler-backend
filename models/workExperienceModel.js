
import { Schema, model } from 'mongoose';

const workExperienceSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },  
  currentlyWorking:String,
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

const WorkExperience = model('WorkExperience', workExperienceSchema);

export default WorkExperience;
