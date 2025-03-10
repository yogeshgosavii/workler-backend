import { Schema } from 'mongoose';
import Location from './locationModel.js';

const companySchema = new Schema({
    about: { type: Number},
    website: { type: String },
    industry : { type: String},
    employees_working : {type : Number},
    found_in_date : {type : Date},
    company_name : {type : String}
});

export default companySchema;
