// personalDetailsModel.js

import { Schema } from 'mongoose';
import Location from './locationModel.js'

const personalDetailsSchema = new Schema({
  firstname: String,
  lastname : String,
  phone:Number,
  bio : String,
  about : String,
  location:{type : Location},
  birthdate : Date,
  working_at : String,
  website : String
  // Add other fields as needed
});

// const PersonalDetails = model('PersonalDetails', personalDetailsSchema);

export default personalDetailsSchema;
