import { Schema, model } from 'mongoose';

const educationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
    educationType:String,
  university: String,
  course: String,
  specialization: String,
  start_month: Date,
  end_month: Date,
  board: String,
  grades: Number,
  school_name: String,
  passing_out_year: Number,
  marks: Number,
  maths: Number,
  physics: Number,
  chemistry: Number,
  educationMode : String
});

const Education = model('Education', educationSchema);

export default Education;
