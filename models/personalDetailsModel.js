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
  portfolio : String
  // Add other fields as needed
});

// const PersonalDetails = model('PersonalDetails', personalDetailsSchema);

export default personalDetailsSchema;
