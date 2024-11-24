import mongoose from 'mongoose';
import PersonalDetails from './personalDetailsModel.js';
import CompanyDetails from './companyModel.js';
import Location from './locationModel.js'
import imageSchema from './imageModel.js';
import { Schema } from 'mongoose';


const userSchema = new mongoose.Schema({
  email: { type: String},
  password: { type: String},
  username: { type: String },
  account_type: { type: String },
  githubLink: { type: String },
  linkedInLink: { type: String },
  description : {type: String},
  bio : {type : String},
  tags: { type: [String] },
  location:{type : Location, default: null},
  profileImage: { type: imageSchema }, 
  followers : {type :Number},
  following  : {type : Number},
  saved_jobs : [{ type: Schema.Types.ObjectId, ref: "Job" }],
  saved_profiles : [{ type: Schema.Types.ObjectId, ref: "User" }],
  personal_details: { type: PersonalDetails },
  posts: [{ type: Schema.Types.ObjectId, ref: "Posts" }],
  company_details: { type: CompanyDetails },
  resetPasswordToken : {type:String},
  resetPasswordExpire : {type : Date}
});

const User = mongoose.model('User', userSchema);

export default User;
