
import { Schema, model } from 'mongoose';

const descriptionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },  description:String
 });

const Description = model('Description', descriptionSchema);

export default Description;
