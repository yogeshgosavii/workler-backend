import mongoose from 'mongoose';
import PersonalDetails from './personalDetailsModel.js';
import CompanyDetails from './companyModel.js';
import Location from './locationModel.js'


const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  account_type: { type: String },
  githubLink: { type: String },
  linkedInLink: { type: String },
  description : {type: String},
  bio : {type : String},
  tags: { type: [String] },
  location:{type : Location},
  profileImage: { type: String }, 
  profileImageCompressed: { type: String },
  followers : {type :Number},
  following  : {type : Number},
  personal_details: { type: PersonalDetails },
  company_details: { type: CompanyDetails },
});

// Conditional population of fields

const User = mongoose.model('User', userSchema);

export default User;
