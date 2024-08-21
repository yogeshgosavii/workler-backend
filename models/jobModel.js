import { Schema, model } from 'mongoose';
import Location from './locationModel.js'
const jobSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
      },
    job_role: { type: String, required: true },
    min_salary :{type : Number},
    max_salary : {type : Number},
    source : {type : String},
    description: { type: String},
    company_name : {type :String },
    location : {type:Location},
    job_type : {type:String},
    skills_required: {type : [String]},
    experience_type : {type : String},
    min_experience : {type: Number},
    max_experience : {type : Number},
    job_tags : {type : [String]},
    company_logo : {type : String},
    job_url : {type:String},
    job_source : {type :String},

    candidates_applied :[{ type: Schema.Types.ObjectId, ref: "User" }],
    candidate_limit : {type : Number}
}, { timestamps: true });

const Job = model('Job', jobSchema);

export { jobSchema, Job };
