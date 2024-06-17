
import { Schema, model } from 'mongoose';

const skillSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },  
  name: String,
  level: String,
});

const Skill = model('Skill', skillSchema);

export default Skill;
