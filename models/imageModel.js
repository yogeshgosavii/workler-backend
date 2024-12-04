// images model (imageSchema.js)
import mongoose from 'mongoose';

// Define the image schema
const imageSchema = new mongoose.Schema({
  originalImage: { 
    type: [String], 
   
  },
  compressedImage: { 
    type: [String], 
   
}});

export default imageSchema;
