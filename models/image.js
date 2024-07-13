import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
    originalImage: { type: String }, 
    compressedImage : {type : String}
});

const Image = mongoose.model('Image', imageSchema);

export default Image;
