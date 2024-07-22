import { Schema } from 'mongoose';

const workSchema = new Schema({
    position: { type: String},
    company_name: { type: Number },
    address : { type: String},
    post_code:{ type: Number}
});

export default workSchema;
