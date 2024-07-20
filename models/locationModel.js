import { Schema as _Schema } from 'mongoose';
const Schema = _Schema;

const locationSchema = new Schema({
    location: { type: String, required: true },
    lon: { type: Number, required: true },
    lat: { type: Number, required: true },
    location: { type: String},
    post_code:{ type: Number}
});

export default locationSchema;
