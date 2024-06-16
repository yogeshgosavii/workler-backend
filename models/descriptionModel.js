
import { Schema, model } from 'mongoose';

const descriptionSchema = new Schema({
  description:String
 });

const Description = model('Description', descriptionSchema);

export default Description;
