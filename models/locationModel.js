import { Schema } from 'mongoose';

const locationSchema = new Schema({
    lon: { type: Number},
    lat: { type: Number },
    address : { type: String},
    post_code:{ type: Number},
});

export default locationSchema;
