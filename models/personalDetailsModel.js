// personalDetailsModel.js

import { Schema } from 'mongoose';
import Location from './locationModel.js'

const personalDetailsSchema = new Schema({
  firstname: String,
  lastname : String,
  phone:Number,
  about : String,
  birthdate : Date,
  working_at : String,
  latest_education : String,
  portfolio : String,
  gender : String,
  education : String
  // Add other fields as needed
});

// const PersonalDetails = model('PersonalDetails', personalDetailsSchema);

export default personalDetailsSchema;
