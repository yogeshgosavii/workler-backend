// personalDetailsModel.js

import { Schema, model } from 'mongoose';

const personalDetailsSchema = new Schema({
  fullname: String,
  phone:Number,
  address:String,
  birthdate : Date
  // Add other fields as needed
});

const PersonalDetails = model('PersonalDetails', personalDetailsSchema);

export default PersonalDetails;
