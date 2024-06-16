import { Schema, model } from 'mongoose';

const educationSchema = new Schema({
  educationType:String,
  university: String,
  course: String,
  specialization: String,
  start_year: Number,
  end_year: Number,
  board: String,
  school_name: String,
  passing_out_year: Number,
  marks: Number,
  maths: Number,
  physics: Number,
  chemistry: Number,
});

const Education = model('Education', educationSchema);

export default Education;
