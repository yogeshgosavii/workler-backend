// personalDetailsModel.js

const mongoose = require('mongoose');

const personalDetailsSchema = new mongoose.Schema({
  fullname: String,
  phone:Number,
  address:String,
  birthdate : Date
  // Add other fields as needed
});

const PersonalDetails = mongoose.model('PersonalDetails', personalDetailsSchema);

module.exports = PersonalDetails;
