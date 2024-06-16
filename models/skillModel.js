// skillModel.js

import { Schema, model } from 'mongoose';

const skillSchema = new Schema({
  name: String,
  level: String,
});

const Skill = model('Skill', skillSchema);

export default Skill;
