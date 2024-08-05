import mongoose from 'mongoose';

// Define the image schema
const imageSchema = new mongoose.Schema({
  originalImage: { type: [String] }, // Array of original image URLs
  compressedImage: { type: [String] } // Array of compressed image URLs
});

// Create and export the Image model
// const Image = mongoose.model('Image', imageSchema);

export default imageSchema;
